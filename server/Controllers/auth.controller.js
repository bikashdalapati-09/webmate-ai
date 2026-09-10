import { json } from "express";
import getToken from "../Configs/token.js";
import User from "../Models/user.model.js";



export const login = async (req, res) => {
    try {
        const {name, email} = req.body;

        if(!name || !email){
            return res.status(400).json({
                message: "Name and Email are required",
                success: false
            })
        }

        let user = await User.findOne({email})

        if(!user){
            user = await User.create({name, email})
        }

        const token = await getToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)
    } catch (error) {
        return res.status(501).json({
            message: `Google auth error ${error}`
        })
    }
}

export const logout = async(req, res) => {
    try {
        await res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        })
        return res.status(200).json({
            message: `logout successfully 👌`
        })
    } catch (error) {
        return res.status(501).json({
            message: `user logout error ${error}`
        })
    }
}