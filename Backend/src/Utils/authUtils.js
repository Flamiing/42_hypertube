// Third-Party Imports:
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Local Imports:
import { createConfirmationToken } from './jsonWebTokenUtils.js';
import userModel from '../Models/UserModel.js';

export async function checkAuthStatus(req) {
    try {
        const { user } = req.session;
        if (user) {
            const userExist = await userModel.findOne({ id: user.id });
            if (userExist && userExist.length !== 0)
                return { isAuthorized: true, user: user };
        }
        return { isAuthorized: false };
    } catch (error) {
        return { isAuthorized: false };
    }
}

export async function sendConfirmationEmail({
    id,
    email,
    username,
    first_name,
}) {
    const { CONFIRM_ACCOUNT_LINK } = process.env;

    const confirmationToken = createConfirmationToken({
        id,
        email,
        username,
        first_name,
    });

    const confirmationLink = `${CONFIRM_ACCOUNT_LINK}${confirmationToken}`;
    const subject = '42 Matcha Confirmation Email';
    const body = `Hello ${first_name},\n\nPlease click on the link below to confirm your account:\n\n${confirmationLink}`;

    await sendEmail(email, subject, body);
}

export async function sendResetPasswordEmail({
    email,
    first_name,
    reset_pass_token,
}) {
    const { RESET_PASSWORD_LINK } = process.env;

    const resetPasswordLink = `${RESET_PASSWORD_LINK}${reset_pass_token}`;
    const subject = '42 Matcha Reset Password Email';
    const body = `Hello ${first_name},\n\nPlease click on the link below to reset your password:\n\n${resetPasswordLink}`;

    await sendEmail(email, subject, body);
}

export async function sendEmail(email, subject, body) {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT),
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
        },
    });

    const mail = {
        from: EMAIL_USER,
        to: email,
        subject: subject,
        text: body,
    };

    const info = await transporter.sendMail(mail);
    console.info('Email info: ', info);
}

export async function hashPassword(password) {
    const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
    const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return encryptedPassword;
}

export function isIgnored(ignoredRoutes, path) {
    return ignoredRoutes.some((pattern) => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '$');
        return regex.test(path);
    });
}

export function setSession(req, accessToken) {
    req.session = { user: null };
    try {
        const { JWT_SECRET_KEY } = process.env;
        const data = jwt.verify(accessToken, JWT_SECRET_KEY);
        req.session.user = data;
    } catch {}
}
