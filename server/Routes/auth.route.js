import express from 'express'
import { login, logout } from '../Controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post("/signin", login)
authRouter.get("/logout", logout)

export default authRouter