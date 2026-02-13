import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.models.js"

// Add a new comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    // Validation
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Create new comment
    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })

    // Populate owner details
    const createdComment = await Comment.findById(comment._id).populate(
        "owner",
        "username email avatar"
    )

    return res
        .status(201)
        .json(new ApiResponse(201, createdComment, "Comment added successfully"))
})

// Get all comments for a video with pagination
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)

    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Aggregate pipeline
    const pipeline = [
        {
            $match: {
                video: video._id
            }
        },
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
                video: 1,
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

    const comments = await Comment.aggregatePaginate(
        Comment.aggregate(pipeline),
        { page: pageNum, limit: limitNum }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    // Find comment
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Check ownership
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment")
    }

    // Update comment
    comment.content = content.trim()
    const updatedComment = await comment.save()

    // Populate owner details
    const result = await Comment.findById(updatedComment._id).populate(
        "owner",
        "username email avatar"
    )

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Comment updated successfully"))
})

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required")
    }

    // Find comment
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // Check ownership
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
}
