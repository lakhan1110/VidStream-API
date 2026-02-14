import { Router } from "express"
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

// Public routes
router.route("/videos/:videoId").get(getVideoComments)

// Protected routes (require authentication)
router.route("/videos/:videoId").post(verifyJWT, addComment)

router.route("/:commentId").patch(verifyJWT, updateComment)

router.route("/:commentId").delete(verifyJWT, deleteComment)

export default router
