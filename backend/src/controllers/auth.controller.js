
import { upsertStreamUser } from "../lib/stream.js"
import User from "../model/User.js"
import jwt from "jsonwebtoken"
export async function signup(req, res) {
    try {
        const { email, password, fullName } = req.body
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "minimum password  length is 6" })
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User Already Existing" });
        }
        const index = Math.floor(Math.random() * 100) + 1
        const randomAvatar = `https://avatar.iran.liara.run/public/${index}`

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        })
        console.log("the newUser is ", newUser)
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || ""
            })
            console.log(`stream user created for the ${newUser._id}`)
        } catch (error) {
            console.log("Error creating stream users", error)
        }
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        })

        res.status(201).json({
            success: true,
            user: newUser
        })

    } catch (error) {
        console.log("Error in signup", error)
        res.status(400).json({ message: "Internal Server Error" })
    }
}
export async function login(req, res) {
    try {

        const { email, password } = req.body
        console.log("the data is", req.body)
        if (!email || !password) {
            return res.status(400).json({ message: "All Fields are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "Invalid Email or Password" })
        }
        const isPasswordcorrect = await user.matchPassword(password)
        console.log(isPasswordcorrect)
        if (!isPasswordcorrect) return res.status(401).json({ message: "Invalid Email or Password" })

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        })
        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {
        console.error("Error in the Login ", error)
        console.log("Error in login controller")
        res.status(500).json({ message: "Internal Server Error" })
    }

}
export function logout(req, res) {
    res.clearCookie("jwt")
    res.status(200).json({ success: true, message: "Logout successfully" })
}

export async function onboard(req, res) {
    try {
        const userId = req.user._id
        console.log("the  user id is", userId)
        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body
        console.log(req.body)
        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                ...req.body,
                isOnboarded: true
            },
            { new: true }
        )

        console.log("the updated user is ", updatedUser)
        if (!updatedUser) {
            return res.status(404).json({ messgae: "User not Found" })
        }
        try {
            await upsertStreamUser({
                id:updatedUser._id.toString(),
                name:updatedUser.fullName,
                image:updatedUser.profilePic|| ""
            })
            console.log(`the stream user created after onboarding ${updatedUser.fullName}`)
        } catch (SreamError) {
            console.log("Error in stream user after onboarding",StreamError.message)
        }
        res.status(200).json({
            success: true,
            user: updatedUser
        })
    } catch (error) {
        console.error("Error in the onboard function", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}