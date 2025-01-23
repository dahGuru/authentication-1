import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

import { mailtrapClient, sender } from "./mailtrapConfig.js";

export const sendVerificationEmail = async (email, name, verificationToken) => {
    const recipient = [{ email }];
    const emailTemplate = VERIFICATION_EMAIL_TEMPLATE
        .replace("{verificationCode}", verificationToken)
        .replace("{userName}", name);


    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: emailTemplate,
            category: "Email Verification",
        });

        console.log("Email sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification`, error);

        throw new Error(`Error sending verification email: ${error}`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "b9be54b2-e5da-4a3d-be7d-25d38057ae93",
            template_variables: {
                company_info_name: "Gurus Konnect",
                name: name,
            },
        });

        console.log("Welcome email sent successfully", response);
    } catch (error) {
        console.error(`Error sending welcome email`, error);

        throw new Error(`Error sending welcome email: ${error}`);
    }
};

export const sendPasswordResetEmail = async (email, name, resetURL) => {
    const recipient = [{ email }];
    const emailTemplate = PASSWORD_RESET_REQUEST_TEMPLATE
        .replace("{resetURL}", resetURL)
        .replace("{userName}", name);

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: emailTemplate,
            category: "Password Reset",
        });
    } catch (error) {
        console.error(`Error sending password reset email`, error);

        throw new Error(`Error sending password reset email: ${error}`);
    }
};

export const sendResetSuccessEmail = async (email, name) => {
    const recipient = [{ email }];
    const emailTemplate = PASSWORD_RESET_SUCCESS_TEMPLATE
        .replace("{userName}", name);
    // .replace("{verificationCode}", verificationToken)

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: emailTemplate,
            category: "Password Reset",
        });

        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.error(`Error sending password reset success email`, error);

        throw new Error(`Error sending password reset success email: ${error}`);
    }
};