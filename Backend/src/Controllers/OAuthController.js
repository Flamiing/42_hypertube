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
        '42': OAuthController.get42OAuthUserData
    }

    static async handleOAuth(req, res) {
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        const { provider } = req.params;
        if (!provider || !(provider in OAuthController.OAUTH_STRATEGIES))
            return res.status(404).json({ msg: StatusMessage.OAUTH_PROVIDER_NOT_FOUND })

        const data = await OAuthController.OAUTH_STRATEGIES[provider](req, res);
        if (!data) return res;

        const validatedUser = await validatePartialUser(data);
        validatedUser.data.active_account = true;
        validatedUser.data.oauth = true;

        const isUserRegistered = await OAuthController.loginOAuth(res, validatedUser);
        if (isUserRegistered || isUserRegistered === null) return res;
        return await registerUser(res, validatedUser, true);
    }

    static async get42OAuthUserData(req, res) {
        const { OAUTH_CLIENT_ID, OAUTH_SECRET_KEY } = process.env;

        const { code } = req.body;

        try {
            const tokenResponse = await axios.post(
                'https://api.intra.42.fr/oauth/token',
                {
                    grant_type: 'authorization_code',
                    client_id: OAUTH_CLIENT_ID,
                    client_secret: OAUTH_SECRET_KEY,
                    code: code,
                    redirect_uri: process.env.CALLBACK_ROUTE,
                }
            );

            const accessTokenOAuth = tokenResponse.data.access_token;
            const userOAuth = await axios.get('https://api.intra.42.fr/v2/me', {
                headers: {
                    Authorization: `Bearer ${accessTokenOAuth}`,
                },
            });

            const data = {
                email: userOAuth.data.email,
                username: userOAuth.data.login,
                first_name: userOAuth.data.first_name,
                last_name: userOAuth.data.last_name
            };

            return data;
        } catch (error) {
            console.error(
                'ERROR:',
                error.response?.data?.error_description ?? error
            );
            if (error.response?.status === 401)
                return returnErrorStatus(res, 401, error.response.data.error_description)
            return returnErrorStatus(res, 500, StatusMessage.INTERNAL_SERVER_ERROR)
        }
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
