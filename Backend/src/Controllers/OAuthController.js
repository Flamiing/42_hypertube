// Third-Party Imports:
import axios from 'axios';

// Local Imports:
import userModel from '../Models/UserModel.js';
import StatusMessage from '../Utils/StatusMessage.js';
import {
    registerUser,
    createAuthTokens,
    checkAuthStatus,
} from '../Utils/authUtils.js';
import { validatePartialUser } from '../Schemas/userSchema.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';

export default class OAuthController {
    static OAUTH_STRATEGIES = {
        google: OAuthController.getGoogleOAuthUserData,
        github: OAuthController.getGitHubOAuthUserData,
        '42': OAuthController.get42OAuthUserData,
    };

    static async handleOAuth(req, res) {
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        const { provider } = req.params;
        if (!provider || !(provider in OAuthController.OAUTH_STRATEGIES))
            return res
                .status(404)
                .json({ msg: StatusMessage.OAUTH_PROVIDER_NOT_FOUND });

        const data = await OAuthController.OAUTH_STRATEGIES[provider](req, res);
        if (!data) return res;

        const validatedUser = await validatePartialUser(data);
        validatedUser.data.active_account = true;
        validatedUser.data.oauth = true;

        const isUserRegistered = await OAuthController.loginOAuth(
            res,
            validatedUser
        );
        if (isUserRegistered || isUserRegistered === null) return res;
        return await registerUser(res, validatedUser, true);
    }

    static async get42OAuthUserData(req, res) {
        const { OAUTH_42_CLIENT_ID, OAUTH_42_SECRET_KEY } = process.env;

        const { code } = req.body;

        try {
            const tokenEndpoint = 'https://api.intra.42.fr/oauth/token';
            const userInfoEndpoint = 'https://api.intra.42.fr/v2/me';

            const userInfo = await OAuthController.getUserInfo(
                OAUTH_42_CLIENT_ID,
                OAUTH_42_SECRET_KEY,
                code,
                tokenEndpoint,
                userInfoEndpoint
            );

            const data = {
                email: userInfo.data.email,
                username: userInfo.data.login,
                first_name: userInfo.data.first_name,
                last_name: userInfo.data.last_name,
            };

            return data;
        } catch (error) {
            console.error(
                'ERROR:',
                error.response?.data?.error_description ?? error
            );
            if (error.response?.status === 401)
                return returnErrorStatus(
                    res,
                    401,
                    error.response.data.error_description
                );
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        }
    }

    static async getGoogleOAuthUserData(req, res) {
        const { OAUTH_GOOGLE_CLIENT_ID, OAUTH_GOOGLE_SECRET_KEY } = process.env;

        const { code } = req.body;

        try {
            const tokenEndpoint = 'https://oauth2.googleapis.com/token';
            const userInfoEndpoint =
                'https://www.googleapis.com/oauth2/v2/userinfo';

            const userInfo = await OAuthController.getUserInfo(
                OAUTH_GOOGLE_CLIENT_ID,
                OAUTH_GOOGLE_SECRET_KEY,
                code,
                tokenEndpoint,
                userInfoEndpoint
            );

            const data = {
                email: userInfo.data.email,
                username: username,
                first_name: userInfo.data.given_name,
                last_name: userInfo.data.family_name,
            };

            return data;
        } catch (error) {
            console.error(
                'ERROR:',
                error.response?.data?.error_description ?? error
            );
            if (error.response?.status === 401)
                return returnErrorStatus(
                    res,
                    401,
                    error.response.data.error_description
                );
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        }
    }

    static async getGitHubOAuthUserData(req, res) {
        const { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_SECRET_KEY } = process.env;
        
        const { code } = req.body;

        try {
            const tokenEndpoint = 'https://github.com/login/oauth/access_token'
            const userInfoEndpoint = 'https://api.github.com/user'

            const userInfo = await OAuthController.getUserInfo(
                OAUTH_GITHUB_CLIENT_ID,
                OAUTH_GITHUB_SECRET_KEY,
                code,
                tokenEndpoint,
                userInfoEndpoint
            )

            const data = {
                email: userInfo.data.email,
                username: userInfo.data.login,
                first_name: userInfo.data.name ? userInfo.data.name : userInfo.data.login,
                last_name: userInfo.data.name ? userInfo.data.name : userInfo.data.login,
                biography: userInfo.data.bio ? userInfo.data.bio : null  
            };

            if (!data.biography) delete data.biography

            return data;
        } catch (error) {
            console.error(
                'ERROR:',
                error.response?.data?.error_description ?? error
            );
            if (error.response?.status === 401)
                return returnErrorStatus(
                    res,
                    401,
                    error.response.data.error_description
                );
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        }
    }

    static async getUserInfo(clientId, secretKey, code, tokenEndpoint, userInfoEndpoint) {
        const tokenResponse = await axios.post(
            tokenEndpoint,
            {
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: secretKey,
                code: code,
                redirect_uri: process.env.CALLBACK_ROUTE,
            },
            {
                headers: {
                    Accept: 'application/json'
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;
        const userInfo = await axios.get(userInfoEndpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return userInfo;
    }

    static async loginOAuth(res, validatedUser) {
        const reference = {
            username: validatedUser.data.username,
        };

        const user = await userModel.getByReference(reference, true);
        if (!user) {
            res.status(500).json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            return null;
        }
        if (user.length === 0) return false;

        if (user.oauth) {
            await createAuthTokens(res, user);
            if (!('set-cookie' in res.getHeaders())) return res;
            res.json({ msg: StatusMessage.LOGIN_SUCCESS });
            return true;
        }

        return false;
    }
}
