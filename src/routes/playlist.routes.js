import { Router } from "express"
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

// All routes require authentication
router.use(verifyJWT)

// Create playlist
router.route("/").post(createPlaylist)

// Get user playlists
router.route("/").get(getUserPlaylists)

// Get playlist by ID
router.route("/:playlistId").get(getPlaylistById)

// Update playlist
router.route("/:playlistId").patch(updatePlaylist)

// Delete playlist
router.route("/:playlistId").delete(deletePlaylist)

// Add video to playlist
router.route("/:playlistId/videos/:videoId").post(addVideoToPlaylist)

// Remove video from playlist
router.route("/:playlistId/videos/:videoId").delete(removeVideoFromPlaylist)

export default router
