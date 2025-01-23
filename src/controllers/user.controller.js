import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    
    // get user details from frontend
    //validate
    //check if user already exist : username, email
    // check for images and avatar
    // upload images to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // return responce
    // check for user creation
    // return responce


    const {fullname, email, username, password }  = req.body
    console.log("Email : ", email);

    if( 
        [fullname, email, username, password].some((field) =>
            field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are rewuired")
    }
    

    const existedUser = await User.findOne({ 
        $or : [{username}, {email}] // username or email
    })

    if (existedUser){
        throw new ApiError(409, "User with email or username already exist")
    }
    

  const avatarLocalPath = req.files?.avatar[0]?.path;  // we are using optional chaining here, if there is no avatar file then it will return undefined
  const coverImageLocalPath =req.files?.coverImage[0]?.path; // we atr getting this from multer feature. refer to 9 : 8 


  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required");
  }



const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400, "Avatar file is required");
}

User.create({
    fullname,
    avatar: avatar.url,
    coverImage : coverImage?.url || "",  // if coverImage is not provided then we are setting it to empty string
    email,
    password,
    username: username.toLowerCase()
})

    const createdUser = User.findById(User.id).select(
        "-password -refreshToken"  // we are removing password and refreshToken from the response
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User registered successfully"
    ))

    // just refer the 10 : 00 for postmanuser/register {{server part}}

})  


export {registerUser} 