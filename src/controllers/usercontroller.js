import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiresponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken =  async (userId) => {
   try {
     const user = await User.findById(userId)
 
 
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()
 
     user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false})
     return { accessToken, refreshToken }
 }
 
    catch (error) {
      throw new ApiError(500, "failed to generate access and refresh token")
     }
}


const registerUser = asyncHandler(async (req, res) => {
try {
        const { fullname, email, username, password } = req.body
  
  
       if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
       
        throw new ApiError(400, "all fields are required")
    
      }
  
     const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   
   
    })
   
    if (existedUser) {
     
      throw new ApiError(409, "user with same username or email already exists")
    
    }
    
    console.warn(req.files) 
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path
   
    const coverlocalPath = req.files?.coverImage?.[0]?.path
  
    if (!avatarLocalPath) {
     
       throw new ApiError(400, "avatar image is required")
   
      }
  
    
   //   const avatar = await uploadOnCloudinary(avatarLocalPath)
    
   // const coverImage = coverlocalPath ? await uploadOnCloudinary(coverlocalPath) : null
  
   let avatar;
   try {
       avatar = await uploadOnCloudinary(avatarLocalPath)
        console.log("Avatar uploaded successfully:", avatar)
     }  catch (error) {
         console.log("Error uploading avatar", error)
         throw new ApiError(500, "avatar upload failed")
     }

   let coverImage ;
    try {
        coverImage = await uploadOnCloudinary(coverlocalPath)
        console.log("Cover image uploaded successfully:", coverImage)
     }  catch (error) {
         console.log("Error uploading cover image", error)
         throw new ApiError(500, "cover image upload failed")
     }
    
    
    try {
       const user = await User.create({
          fullname,
          avatar: avatar?.url,
          coverImage: coverImage?.url || "",
          email,
          password,
          username: username.toLowerCase()
      
      
      })
     
      
      
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )
  
  
      if (!createdUser) {
        
        throw new ApiError(500, "user creation failed")
      }
    
    
      return res
        .status(201)
        .json(
          new ApiResponse(200, createdUser, "user created successfully")
        )
    } catch (error) {
      console.log("user creation failed")

      if(avatar){
        await deleteFromCloudinary(avatar.public_id)
      } 
      if(coverImage){
        await deleteFromCloudinary(coverImage.public_id)
      }

      throw new ApiError(500, "something went wrong while registering a user")
    }
  
} 
   
catch (error) {
     throw new ApiError(500 , error.message || "user registration failed") 
}

})

const loginUser = asyncHandler(async (req, res) => {
  //get data from body
  const {email, username, password} = req.body

  //validation
  if([email, username, password].some((field) => field?.trim() === "")){
    throw new ApiError(400, "all fields are required")
  }

  const user = await User.findOne({
    $or: [{email}, {username}]
  })  

  if(!user){
    throw new ApiError(404, "user not found with provided credentials")
  }

  //validate password
  const isPasswordValid = await user.isPasswordCorrect(password)
  
  if(!isPasswordValid){
    throw new ApiError(401, "invalid credentials")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id)
  .select("-password -refreshToken");

  if(!loggedInUser){
    throw new ApiError(404, "failed to fetch user after login")
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
 }
  
 return res
 .status(200)
  .cookie("refreshToken", refreshToken, options)
  .cookie("accessToken", accessToken, options)
 .json(new ApiResponse(200,
  {user: loggedInUser, accessToken, refreshToken},))

})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: {
       refreshToken: undefined,
       } 
      },
      {new: true}

  )
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  
  }


  return res
  .status(200)
  .clearCookie("refreshToken", options)
  .clearCookie("accessToken",  options)
  .json(new ApiResponse(200, {}, "logged out successfully"))


})

const refreshAccessToken = asyncHandler(async (req, res) => 
{
   const incomingRefreshToken = req.cookies.refreshToken || 
   req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "refresh token is required")
  }
  
  try {
   const decodedToken =  jwt.verify(
      incomingRefreshToken, 
      process.env.REFRESH_TOKEN_SECRET
   )

  const user =  await User.findById(decodedToken?._id)
    
  if(!user){
    throw new ApiError(401, "Invalid refresh token")
  }


  if(user?.refreshToken !== incomingRefreshToken){
    throw new ApiError(401, "Invalid refresh token")

  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

   const { accessToken, refreshToken : newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(
      200, 
      { accessToken,
         refreshToken: newRefreshToken 
        },
          "access token refreshed successfully"))


        }  catch (error) {
           throw new ApiError(500, "something went wrong while refreshing access token")
  }

})


const changeCurrentUserPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid =  await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400, "invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"))

})

const updateAccountDetails = asyncHandler(async (req, res) => {
   const {fullname, email} = req.body
   
   
   if(!fullname || !email){
    throw new ApiError(400, "fullname and email are required")
   }
  
   //user.findById().select("-password")

   const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname, 
        email: email
      }
    },
    {new: true}
  ).select("-password, -refreshToken")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "account details updated successfully"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
   .status(200)
   .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500,"Failed to upload avatar");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {avatar: avatar.url}
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover image is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage){
        throw new ApiError(500,"Failed to upload cover image");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {coverImage: coverImage.url}
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Cover image updated successfully"))
})


export { registerUser, 
        loginUser, 
        refreshAccessToken ,
        logoutUser,
        changeCurrentUserPassword,
        updateAccountDetails,
        getCurrentUser,
        updateUserAvatar,
        updateUserCoverImage
      }