import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.model.js"

// Create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    // Validation
    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }

    // Create new tweet
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    })

    // Populate owner details
    const createdTweet = await Tweet.findById(tweet._id).populate(
        "owner",
        "username email avatar"
    )

    return res
        .status(201)
        .json(new ApiResponse(201, createdTweet, "Tweet created successfully"))
})

// Get all tweets with pagination
const getAllTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query

    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)

    // Aggregate pipeline
    const pipeline = [
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                "owner.username": 1,
                "owner.email": 1,
                "owner.avatar": 1,
                "owner._id": 1
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]

    const tweets = await Tweet.aggregatePaginate(
        Tweet.aggregate(pipeline),
        { page: pageNum, limit: limitNum }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

// Get tweets by a specific user
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const tweets = await Tweet.find({ owner: userId })
        .populate("owner", "username email avatar")
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"))
})

// Update a tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }

    // Find tweet
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Check ownership
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    // Update tweet
    tweet.content = content.trim()
    const updatedTweet = await tweet.save()

    // Populate owner details
    const result = await Tweet.findById(updatedTweet._id).populate(
        "owner",
        "username email avatar"
    )

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Tweet updated successfully"))
})

// Delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    // Find tweet
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Check ownership
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    // Delete tweet
    await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

export {
    createTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
    deleteTweet
}
