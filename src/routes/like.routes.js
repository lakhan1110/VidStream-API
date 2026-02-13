import { Router } from "express"
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

// All routes require authentication
router.use(verifyJWT)

// Like/Unlike video
router.route("/video/:videoId").post(toggleVideoLike)

// Like/Unlike comment
router.route("/comment/:commentId").post(toggleCommentLike)

// Like/Unlike tweet
router.route("/tweet/:tweetId").post(toggleTweetLike)

// Get liked videos
router.route("/videos").get(getLikedVideos)

export default router
