import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/apiresponse.js"
import { Subscription } from "../models/subscription.models.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.models.js"

// Toggle subscription to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    // Check if user is trying to subscribe to themselves
    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    // Check if channel user exists
    const channelUser = await User.findById(channelId)
    if (!channelUser) {
        throw new ApiError(404, "Channel user not found")
    }

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (existingSubscription) {
        // Unsubscribe
        await Subscription.deleteOne({ _id: existingSubscription._id })
        return res
            .status(200)
            .json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribed successfully"))
    } else {
        // Subscribe
        const subscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        return res
            .status(201)
            .json(new ApiResponse(201, { isSubscribed: true }, "Subscribed successfully"))
    }
})

// Get all channels subscribed by current user
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({
        subscriber: req.user._id
    })
        .populate("channel", "username email avatar")
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"))
})

// Get all subscribers of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    // Check if channel user exists
    const channelUser = await User.findById(channelId)
    if (!channelUser) {
        throw new ApiError(404, "Channel user not found")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    })
        .populate("subscriber", "username email avatar")
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"))
})

// Get channel statistics
const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required")
    }

    // Check if channel user exists
    const channelUser = await User.findById(channelId)
    if (!channelUser) {
        throw new ApiError(404, "Channel user not found")
    }

    // Count total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    // Count total videos
    const totalVideos = await Video.countDocuments({
        owner: channelId
    })

    const stats = {
        totalSubscribers,
        totalVideos
    }

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"))
})

export {
    toggleSubscription,
    getSubscribedChannels,
    getChannelSubscribers,
    getChannelStats
}
