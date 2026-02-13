import { Router } from "express"
import { 
    uploadVideo, 
    getVideoById, 
    getAllVideos, 
    updateVideo, 
    deleteVideo, 
    togglePublishStatus 
} from "../controllers/video.controllers.js"
import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

// Public routes
router.route("/").get(getAllVideos)
router.route("/:videoId").get(getVideoById)

// Secured routes (require authentication)
router.route("/upload").post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    uploadVideo
)

router.route("/:videoId").patch(verifyJWT, updateVideo)
router.route("/:videoId").delete(verifyJWT, deleteVideo)
router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus)

export default router
