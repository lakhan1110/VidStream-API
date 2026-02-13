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
router.route("/videos/:videoId/comments").get(getVideoComments)

// Protected routes (require authentication)
router.route("/videos/:videoId/comments").post(verifyJWT, addComment)

router.route("/comments/:commentId").patch(verifyJWT, updateComment)

router.route("/comments/:commentId").delete(verifyJWT, deleteComment)

export default router
