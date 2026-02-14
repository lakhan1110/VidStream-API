import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { Video } from "../models/video.models.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"

// Upload a new video
const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    // Validation
    if (!title || !title.trim()) {
        throw new ApiError(400, "Title is required")
    }

    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoFilePath = req.files?.videoFile[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path

    // Upload to Cloudinary
    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Failed to upload files to Cloudinary")
    }

    try {
        // Create video document
        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title: title.trim(),
            description: description?.trim() || "",
            duration: videoFile.duration || 0,
            owner: req.user._id,
            isPublished: false
        })

        const createdVideo = await Video.findById(video._id)

        return res
            .status(201)
            .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"))

    } catch (error) {
        // If DB creation fails, delete files from Cloudinary
        console.log("Video creation failed, cleaning up Cloudinary files...", error)
        
        if (videoFile?.public_id) {
            await deleteFromCloudinary(videoFile.public_id)
        }
        if (thumbnail?.public_id) {
            await deleteFromCloudinary(thumbnail.public_id)
        }

        throw new ApiError(500, "Failed to save video details. Files cleaned up from server.")
    }
})

// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    // Instead of manual increment, do it in one query if you don't need the old data first
    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } },
        { new: true } // Returns the updated document
    ).populate("owner", "username avatar email")

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))
})

// Get all videos with pagination and filtering
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy = "latest", searchQuery = "" } = req.query

    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)

    // Build search filter
    const searchFilter = searchQuery
        ? { title: { $regex: searchQuery, $options: "i" }, isPublished: true }
        : { isPublished: true }

    // Determine sort order
    let sortOrder = {}
    if (sortBy === "latest") {
        sortOrder = { createdAt: -1 }
    } else if (sortBy === "oldest") {
        sortOrder = { createdAt: 1 }
    } else if (sortBy === "mostViewed") {
        sortOrder = { views: -1 }
    }

    // Aggregate pipeline
    const pipeline = [
        { $match: searchFilter },
        { $sort: sortOrder },
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
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                "owner.username": 1,
                "owner.avatar": 1,
                "owner._id": 1
            }
        }
    ]

    const videos = await Video.aggregatePaginate(
        Video.aggregate(pipeline),
        { page: pageNum, limit: limitNum }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"))
})

// Update video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video")
    }

    // Update fields
    if (title) video.title = title.trim()
    if (description) video.description = description.trim()

    const updatedVideo = await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    // Delete from Cloudinary (optional - extract public ID from URL)
    // deleteFromCloudinary(video.videoFile)
    // deleteFromCloudinary(video.thumbnail)

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

// Toggle publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // Check ownership
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this video")
    }

    video.isPublished = !video.isPublished
    const updatedVideo = await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Publish status toggled successfully"))
})

export {
    uploadVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
