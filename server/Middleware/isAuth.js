import jwt from "jsonwebtoken"
export const isAuth = async(req, res, next) => {
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                message: "User does not have any token 🥲"
            })
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

        if(!verifyToken){
            return res.status(401).json({
                message: "User does not have valid token 🥲"
            })
        }

        req.userId = verifyToken.userId;
        next()
    } catch (error) {
        console.log(`Error in isAuth middleware`);
        console.log(error)
    }
}