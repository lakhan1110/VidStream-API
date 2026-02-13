import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.models.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.models.js"

// Toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check if user already liked this video
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (existingLike) {
        // Unlike the video
        await Like.deleteOne({ _id: existingLike._id })
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Video unliked"))
    } else {
        // Like the video
        const like = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Video liked"))
    }
})

// Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    // Check if comment exists
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Check if user already liked this comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (existingLike) {
        // Unlike the comment
        await Like.deleteOne({ _id: existingLike._id })
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Comment unliked"))
    } else {
        // Like the comment
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Comment liked"))
    }
})

// Toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required")
    }

    // Check if tweet exists
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Check if user already liked this tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (existingLike) {
        // Unlike the tweet
        await Like.deleteOne({ _id: existingLike._id })
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Tweet unliked"))
    } else {
        // Like the tweet
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isLiked: true }, "Tweet liked"))
    }
})

// Get all videos liked by current user
const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query

    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)

    // Find all likes for videos by current user
    const pipeline = [
        {
            $match: {
                likedBy: req.user._id,
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "video.owner"
            }
        },
        {
            $unwind: "$video.owner"
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $project: {
                video: 1,
                createdAt: 1
            }
        }
    ]

    const likedVideos = await Like.aggregatePaginate(
        Like.aggregate(pipeline),
        { page: pageNum, limit: limitNum }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}
