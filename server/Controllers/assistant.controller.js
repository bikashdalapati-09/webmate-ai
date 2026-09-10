import User from "../Models/user.model.js"


export const getAssistantConfig = async(req, res) => {
    try {
        const {userId} = req.params
        const user = await User.findById(userId).select("-geminiApiKey")

        if(!user){
            return res.status(404).json({
                message: "Failed to get User"
            })
        }
        return res.status(200).json({
            message:"Assistant Config Data",
            user
        })
    } catch (error) {
        console.log("Assistant Config Failed");
        console.log(error)
    }
}