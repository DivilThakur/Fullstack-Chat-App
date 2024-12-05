import User from "../models/userModel.js"
import bcrypt from 'bcryptjs'
import validator from 'validator'
import { generateToken } from '../lib/utils.js'
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email" });
        }
        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be atleast of 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUSer = new User({
            fullName,
            email,
            password: hashedPassword
        })
        if (newUSer) {
            generateToken(newUSer._id, res)
            await newUSer.save();

            res.status(201).json({
                _id: newUSer._id,
                fullName: newUSer.fullName,
                email: newUSer.email,
                profilePic: newUSer.profilePic
            })

        } else {
            return res.status(400).json({ message: "Invalid user data" });
        }


    } catch (error) {
        console.log("Error inSignup Controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Inavlid email" });
        }
        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log("Error in Login controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out succesfully" });
    } catch (error) {
        console.log("Error in log out Controller", error.message);
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });

        res.status(200).json(updateUser);

    } catch (error) {
        console.log("Error in updateProfile ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth ");
        res.status(500).json({ message: "Internal server error" });
    }
}