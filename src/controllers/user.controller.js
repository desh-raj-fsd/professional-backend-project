import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res, next) => {
  // Get user details from front-end.
  const { username, email, password, fullName } = req.body;

  // Validation - not empty.
  if (
    [username, email, password, fullName].some((field) => field?.trim() === "")
  )
    throw new ApiError(400, "All fields are required");

  // Check if user already exist! username, email.
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser)
    throw new ApiError(409, "User with email or username already exists.");

  // Check for images, ckeck for avatar.
  const avtarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avtarLocalPath) throw new ApiError(400, "Avatar file is required.");

  // Upload avatar to cloudinary.
  const avatar = await uploadOnCloudinary(avtarLocalPath);

  // Upload coverImage to cloudinary.
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) throw new ApiError(400, "Avatar file is required.");

  // Create user object - create entry in db.
  const user = await User.create({
    fullName,
    email,
    password,
    avatar: avatar.url,
    username: username.toLowerCase(),
    coverImage: coverImage?.url || "",
  });

  // Check for user creation.
  // Remove password and refreshtoken fields from response.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registring a user.");

  // Return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registerd successfully."));
});

export { registerUser };
