# VidStream API

> A feature-rich, production-grade video streaming and social interaction backend RESTful API built with **Node.js**, **Express.js**, **MongoDB**, and **Cloudinary**.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.x-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-blue.svg)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [API Documentation](#-api-documentation)
  - [Healthcheck](#1-healthcheck)
  - [User & Authentication](#2-user--authentication)
  - [Videos](#3-videos)
  - [Comments](#4-comments)
  - [Likes](#5-likes)
  - [Playlists](#6-playlists)
  - [Subscriptions & Channel Stats](#7-subscriptions--channel-stats)
  - [Tweets / Community Posts](#8-tweets--community-posts)
- [Response & Error Handling](#-response--error-handling)
- [Database Models](#-database-models)
- [Author & License](#-author--license)

---

## 🚀 Overview

**VidStream API** is a modular backend service inspired by YouTube and Twitter. It handles core video hosting and community functionalities, including secure user authentication (JWT-based access/refresh token rotation), media uploads (video & thumbnail processing via Multer and Cloudinary), video management with views and publish states, nested comment discussions, polymorphic like systems, channel subscriptions, custom playlists, and micro-blogging community posts.

---

## ✨ Key Features

- **🔐 Robust Authentication & Security**:
  - Secure password hashing with `bcrypt`.
  - Dual JWT mechanism with short-lived **Access Tokens** and long-lived **Refresh Tokens**.
  - Secure `httpOnly` cookie storage and CORS configurations.
- **📹 Video Management**:
  - Direct video and thumbnail upload handling via `Multer` and `Cloudinary`.
  - Automatic cleanup from Cloudinary if database document creation fails.
  - Video stream listing with regex text search, sorting (`latest`, `oldest`, `mostViewed`), and pagination via `mongoose-aggregate-paginate-v2`.
  - View increment tracking and toggleable publish states.
- **💬 Comments System**:
  - Comment threads on any published video with populated author metadata and pagination.
  - Author-only comment updates and deletions.
- **❤️ Universal Like System**:
  - Toggle likes on **videos**, **comments**, and **tweets**.
  - Fetch personalized history of liked videos for authenticated users.
- **📂 Playlist Management**:
  - Create customized video collections.
  - Add or remove videos from playlists with duplicate checks.
- **📢 Subscriptions & Channel Analytics**:
  - Subscribe/unsubscribe to content creators.
  - Fetch channel subscriber lists and followed channels.
  - Aggregated channel statistics (subscriber count & video count).
- **📝 Community Tweets**:
  - Twitter-like micro-post feed for creators to engage with their audience.
- **🛡️ Standardized API Layer**:
  - Centralized error response utility (`ApiError`) and standard response envelope (`ApiResponse`).
  - Async request wrapper (`asyncHandler`) to catch uncaught exceptions uniformly.

---

## 🛠 Tech Stack

| Category | Technology |
| --- | --- |
| **Runtime** | [Node.js](https://nodejs.org/) (ES Modules) |
| **Framework** | [Express.js](https://expressjs.com/) (v5) |
| **Database** | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) (Images & Videos) |
| **File Handling** | [Multer](https://github.com/expressjs/multer) |
| **Security & Auth** | [JSON Web Tokens (JWT)](https://jwt.io/), [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| **Development** | [Nodemon](https://nodemon.io/), [Prettier](https://prettier.io/) |

---

## 📂 Project Architecture

```plaintext
VidStream-API/
├── public/
│   └── temp/                      # Temporary storage for incoming file uploads
├── src/
│   ├── config/
│   │   └── env.js                 # Environment configuration
│   ├── controllers/
│   │   ├── comment.controller.js      # Comment business logic
│   │   ├── healthcheck.controllers.js # Service health check
│   │   ├── like.controller.js         # Video, comment & tweet likes
│   │   ├── playlist.controller.js     # Playlist creation and curation
│   │   ├── subscription.controller.js # Channel subscriptions and metrics
│   │   ├── tweet.controller.js        # Community tweet posts
│   │   ├── usercontroller.js          # Authentication and user profiles
│   │   └── video.controllers.js       # Video uploads and queries
│   ├── db/
│   │   └── index.js               # MongoDB connection logic
│   ├── middlewares/
│   │   ├── auth.middlewares.js    # JWT verification middleware
│   │   ├── error.middleware.js   # Global error handling middleware
│   │   └── multer.middlewares.js  # Multipart/form-data upload middleware
│   ├── models/
│   │   ├── comment.model.js       # Comment schema
│   │   ├── like.models.js         # Polymorphic like schema
│   │   ├── playlist.models.js     # Playlist schema
│   │   ├── subscription.models.js # Subscription relation schema
│   │   ├── tweet.models.js        # Tweet schema
│   │   ├── user.model.js          # User schema & auth methods
│   │   └── video.models.js        # Video schema & pagination plugin
│   ├── routes/
│   │   ├── comment.routes.js
│   │   ├── healthcheck.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   ├── utils/
│   │   ├── ApiError.js            # Custom error class
│   │   ├── apiresponse.js         # Consistent response envelope
│   │   ├── asynchandler.js        # Promise error handling wrapper
│   │   └── cloudinary.js          # Cloudinary upload/delete utility
│   ├── app.js                     # Express app setup and middleware registration
│   ├── constants.js               # Shared constants (e.g., DB name)
│   └── index.js                   # Application entrypoint
├── .env.example                   # Sample environment variable template
├── .gitignore
├── .prettierrc
├── package.json
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)
- [Cloudinary Account](https://cloudinary.com/) (For media asset hosting)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/VidStream-API.git
   cd VidStream-API
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory by duplicating `.env.example`:

```bash
cp .env.example .env
```

Populate the required credentials in your `.env` file:

```env
# Server
PORT=8000
NODE_ENV=development
CORS_ORIGIN=*

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net

# JWT Credentials
ACCESS_TOKEN_SECRET=your_jwt_access_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Running the Application

- **Development Mode** (with automatic hot-reloading via Nodemon):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

The server will initialize and listen on the configured port (default: `http://localhost:8000`).

---

## 📡 API Documentation

Base URL: `http://localhost:8000/api/v1`

### 1. Healthcheck

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/healthcheck` | Check API server status | No |

---

### 2. User & Authentication

Base Route: `/api/v1/users`

| Method | Endpoint | Description | Auth Required | Payload / Form Data |
| --- | --- | --- | --- | --- |
| `POST` | `/register` | Register a new user | No | `multipart/form-data`: `fullname`, `email`, `username`, `password`, `avatar` (file), `coverImage` (optional file) |
| `POST` | `/login` | Log in with credentials | No | `JSON`: `email` or `username`, `password` |
| `POST` | `/logout` | Log out and clear cookies | **Yes** | None |
| `POST` | `/change-password` | Update current user password | **Yes** | `JSON`: `oldPassword`, `newPassword` |
| `GET` | `/current-user` | Get profile of logged-in user | **Yes** | None |
| `PATCH` | `/update-avatar` | Update user avatar image | **Yes** | `multipart/form-data`: `avatar` (file) |
| `PATCH` | `/update-cover-image` | Update user cover image | **Yes** | `multipart/form-data`: `coverImage` (file) |

---

### 3. Videos

Base Route: `/api/v1/videos`

| Method | Endpoint | Description | Auth Required | Query / Payload |
| --- | --- | --- | --- | --- |
| `GET` | `/` | List published videos | No | Query: `page`, `limit`, `sortBy` (`latest`, `oldest`, `mostViewed`), `searchQuery` |
| `GET` | `/:videoId` | Get video details (increments views) | No | Params: `videoId` |
| `POST` | `/upload` | Upload a new video | **Yes** | `multipart/form-data`: `title`, `description`, `videoFile` (file), `thumbnail` (file) |
| `PATCH` | `/:videoId` | Update video details | **Yes** | `JSON`: `title`, `description` |
| `DELETE` | `/:videoId` | Delete video (Owner only) | **Yes** | Params: `videoId` |
| `PATCH` | `/:videoId/toggle-publish` | Toggle public/private visibility | **Yes** | Params: `videoId` |

---

### 4. Comments

Base Route: `/api/v1/comments`

| Method | Endpoint | Description | Auth Required | Payload |
| --- | --- | --- | --- | --- |
| `GET` | `/videos/:videoId` | Get paginated comments for a video | No | Query: `page`, `limit` |
| `POST` | `/videos/:videoId` | Post a comment on a video | **Yes** | `JSON`: `content` |
| `PATCH` | `/:commentId` | Edit comment (Author only) | **Yes** | `JSON`: `content` |
| `DELETE` | `/:commentId` | Delete comment (Author only) | **Yes** | Params: `commentId` |

---

### 5. Likes

Base Route: `/api/v1/likes` *(All endpoints require authentication)*

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/video/:videoId` | Toggle like/unlike on a video | **Yes** |
| `POST` | `/comment/:commentId` | Toggle like/unlike on a comment | **Yes** |
| `POST` | `/tweet/:tweetId` | Toggle like/unlike on a tweet | **Yes** |
| `GET` | `/videos` | Get list of videos liked by current user | **Yes** |

---

### 6. Playlists

Base Route: `/api/v1/playlists` *(All endpoints require authentication)*

| Method | Endpoint | Description | Payload |
| --- | --- | --- | --- |
| `POST` | `/` | Create a new playlist | `JSON`: `name`, `description` |
| `GET` | `/` | Get current user's playlists | None |
| `GET` | `/:playlistId` | Get playlist details by ID | Params: `playlistId` |
| `PATCH` | `/:playlistId` | Update playlist title/description | `JSON`: `name`, `description` |
| `DELETE` | `/:playlistId` | Delete playlist | Params: `playlistId` |
| `POST` | `/:playlistId/videos/:videoId` | Add video to playlist | Params: `playlistId`, `videoId` |
| `DELETE` | `/:playlistId/videos/:videoId` | Remove video from playlist | Params: `playlistId`, `videoId` |

---

### 7. Subscriptions & Channel Stats

Base Route: `/api/v1/subscriptions` *(All endpoints require authentication)*

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/:channelId` | Toggle subscribe / unsubscribe to a channel | **Yes** |
| `GET` | `/me` | Get channels subscribed by current user | **Yes** |
| `GET` | `/channel/:channelId` | Get all subscribers of a channel | **Yes** |
| `GET` | `/channel/:channelId/stats` | Get subscriber & video counts of a channel | **Yes** |

---

### 8. Tweets / Community Posts

Base Route: `/api/v1/tweets`

| Method | Endpoint | Description | Auth Required | Payload |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Get all community tweets (paginated) | No | Query: `page`, `limit` |
| `GET` | `/user/:userId` | Get tweets published by a specific user | No | Params: `userId` |
| `POST` | `/` | Create a tweet | **Yes** | `JSON`: `content` |
| `PATCH` | `/:tweetId` | Update tweet (Author only) | **Yes** | `JSON`: `content` |
| `DELETE` | `/:tweetId` | Delete tweet (Author only) | **Yes** | Params: `tweetId` |

---

## 📦 Response & Error Handling

All responses return a standardized JSON structure.

### Successful Response Format (`ApiResponse`)
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation completed successfully",
  "success": true
}
```

### Error Response Format (`ApiError`)
```json
{
  "statusCode": 400,
  "message": "Invalid input provided",
  "errors": [],
  "success": false,
  "stack": "Error stack trace (development mode only)"
}
```

---

## 🗄 Database Models

- **User**: Stores username, email, full name, avatar, cover image, password hash, refresh token, and watch history references.
- **Video**: Video URL, thumbnail URL, title, description, duration, view counter, publish state, and owner reference.
- **Comment**: Comment text, associated video ID, and author reference.
- **Like**: Flexible schema linking liked entities (`video`, `comment`, or `tweet`) to the liking `User`.
- **Playlist**: Custom playlist name, description, owner reference, and array of video IDs.
- **Subscription**: Relational schema pairing `subscriber` and `channel` (User references).
- **Tweet**: Short post content and author reference.

---

## 👤 Author & License

- **Author**: Lakhan Sharma
- **License**: [ISC](LICENSE)
