import { User } from "../models/userModel.js";
import bcryptjs from 'bcryptjs';
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";
import crypto from 'crypto';

export const signup = async ( req, res ) => {
    const {email,password,name} = req.body;
    try {
        if(!email || !password || !name) {
            throw new error("All fields are required")
        }
        
        const userAlreadyExists = await User.findOne({email});
        if (userAlreadyExists){
            return res.status(400).json({success: false, message: "User Already Exists"});
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const VerificationToken = generateVerificationToken();
        const user = new User ({
            email,
            password: hashedPassword,
            name,
            VerificationToken,
            VerificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        })

        await user.save();

        generateTokenAndSetCookie(res,user._id);

        await sendVerificationEmail(user.email, user.name, VerificationToken);

        res.status(201).json({
            success:true,
            message: "User Created Successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

export const verifyEmail = async ( req, res) => {

    const {code} = req.body;
    try {
        const user = await User.findOne({
            VerificationToken: code,
            VerificationTokenExpiresAt: { $gt: Date.now() }
        })

        if (!user){
            return res.status(400).json({status:false, message: "Invalid or expired verification code"})
        }

        user.isVerified = true;
        user.VerificationToken = undefined;
        user.VerificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })

    } catch (error) {
        console.log("error in ", error);
        res.status(500).json({success: false, message: "Server error"});
    }
};

export const login = async ( req, res ) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({ success: false, message: "Invalid credentials"});
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials"});
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })


    } catch (error) {
        console.log("error in ", error);
        res.status(500).json({success: false, message: error.message });
    }
};
export const logout = async ( req, res ) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out sucessfully"});
};
export const forgotPassword = async ( req, res ) => {
    const { email } = req.body
   try {
    const user = await User.findOne({email});

    if (!user) {
        return res.status(400).json({ success: false, message: "User not found"})
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 //1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(user.email, user.name, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

   } catch (error) {
    console.error(`Error sending password reset email`, error);
    res.status(500).json({ success: false, message: `Error sending password reset email: ${error.message}` });
    throw new Error(`Error sending password reset email: ${error}`)
   }
};
export const resetPassword = async (req, res) => {
    
    try {
        const {token} = req.params;
        const {password} = req.body;  
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user){
            return res.status(400).json({ success: false, message: "Invalid or expired reset token"})
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save()

        await sendResetSuccessEmail(user.email, user.name);

        res.status(200).json({success: true, message: "Password reset successful"})
    } catch (error) {
        console.log("Error in resetPassword", error);
        res.status(400).json({success: false, message: error.message});
        
    }
};
export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checkAuth", error);
        res.status(400).json({ success: false, message: error.message});
    }
}