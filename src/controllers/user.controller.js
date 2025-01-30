import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async(userId) => {
    try{
    
       const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({validateBeforeSave: false}) // we are not validating before saving. go to 21 : 00 in part 2

        return {accessToken, refreshToken}
        
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating access token")
    }
}

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


const loginUser = asyncHandler(async (req, res) => {
    
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies

    const {email, username, password} = req.body

    if(!email || !username){
        throw new ApiError(400, "Please provide email or username")
    }
    
    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPassswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(403, "Invalid password")
    }

 const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id) // we are generating access and refresh tokens. there is underscore because we are not using it. 


  const loogedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly : true,
    secure: true
  }

  return res.status(200).cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
        200,
        {
            user: loogedInUser, accessToken,
            refreshToken
        },
        "User logged in successfully"
    )
  )


})




const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})



export {registerUser, loginUser, logoutUser} 