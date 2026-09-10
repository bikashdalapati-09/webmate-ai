import express from 'express'
import { isAuth } from '../Middleware/isAuth.js'
import { getCurrentUser, saveAssistant, projectAiResponse } from '../Controllers/user.controller.js'

const userRouter = express.Router()

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.post("/save-assistant", isAuth, saveAssistant);
userRouter.post("/project-ai-response", projectAiResponse);

export default userRouter