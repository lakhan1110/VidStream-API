import { Router } from "express"

import { 
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentUserPassword,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/usercontroller.js"

import { upload } from "../middlewares/multer.middlewares.js"

import { verifyJWT } from "../middlewares/auth.middlewares.js"


const router = Router()

// Public routes
router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1}
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// Secured routes (require authentication)
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/change-password").post(verifyJWT, changeCurrentUserPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

export default router