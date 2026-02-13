import { Router } from "express"
import {
    toggleSubscription,
    getSubscribedChannels,
    getChannelSubscribers,
    getChannelStats
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

// All routes require authentication
router.use(verifyJWT)

// Toggle subscription
router.route("/:channelId").post(toggleSubscription)

// Get subscribed channels
router.route("/me").get(getSubscribedChannels)

// Get channel subscribers
router.route("/channel/:channelId").get(getChannelSubscribers)

// Get channel stats
router.route("/channel/:channelId/stats").get(getChannelStats)

export default router
