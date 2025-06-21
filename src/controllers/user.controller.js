import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
 



const regiterUser = asyncHandler(async (req,res) => {
    // Step by step

    //1.get user details from fronted
    const {fullname,email,username,password } = req.body
    console.log("email : ",email);
    
    //2.validation -> not empty
    if(
        // By using some method in array we can check at a time and it return true or false 
        [fullname,email,username,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    //3.check if user already exist : username,email
    const existedUser = User.findOne({
        $or: [{ username },{ email }] 
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    // 4.check for images ,check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    //5. upload them to cloudinary,avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // check for avatar 
    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    // 6.create user object -> create entry in db
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })
    

    //7.remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
  
    // 8.check for user creation 
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }


    //9. return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})


export {regiterUser}