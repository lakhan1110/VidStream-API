import { Router } from "express"
import {
    createTweet,
    getAllTweets,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

// Public routes
router.route("/").get(getAllTweets)

router.route("/user/:userId").get(getUserTweets)

// Protected routes (require authentication)
router.route("/").post(verifyJWT, createTweet)

router.route("/:tweetId").patch(verifyJWT, updateTweet)

router.route("/:tweetId").delete(verifyJWT, deleteTweet)

export default router
