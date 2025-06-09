
import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getRecommendedusers,getMyFriends,sendFriendRequest,acceptFriendRequest,getMyFriendRequests,getOutgoingFriendRequests } from "../controllers/user.controller.js"
const router = express.Router()


router.use(protectRoute)
router.get("/",  getRecommendedusers)
router.get("/friends", getMyFriends)
router.post("/friend-request/:id",sendFriendRequest)
router.put("/friend-request/:id/accept",acceptFriendRequest)
router.get("/friend-requests",getMyFriendRequests)
router.get("/outgoing-friend-requests",getOutgoingFriendRequests)
export default router