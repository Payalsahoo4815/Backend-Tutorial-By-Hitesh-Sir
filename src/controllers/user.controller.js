import {asyncHandler} from "../utils/asyncHandler.js"




const regiterUser = asyncHandler(async (req,res) => {
    return res.status(200).json({
        message : "OK"
    })
})


export {regiterUser}