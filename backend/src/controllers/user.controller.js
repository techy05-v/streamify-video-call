

import FriendRequest from "../model/FriendRequest.js";
import User from "../model/User.js";
export async function getRecommendedusers(req,res){
    try {
        const currentUserId = req.user.id
        const currentUser = req.user
        const recommendedUsers = await User.find({
            $and:[{_id:{$ne:currentUserId}},{_id:{$nin:currentUser.friends}},{isOnboarded:true}]
        })
        res.status(200).json(
            recommendedUsers
        )
    } catch (error) {
        console.error("Error in the getRecommendedUsers controller",error)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export async function getMyFriends(req,res){
    try {
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends","fullName profilePic nativeLanguage learningLanguage")
        res.status(200).json(user.friends)
    } catch (error) {
        console.error("Error in the getMyFriends controller",error)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export async function sendFriendRequest(req,res){
    try {
        const myId = req.user.id
        const {id:recipientId}= req.params
        if(myId === recipientId){
            return res.status(400).json({message:" you can't send the friend request to yourself"})
        }
        const recipient = await User.findById(recipientId)
        if(!recipient){
            res.staus(404).json({messgae:"Recipient is not Found"})
        }
        if(recipient.friends.includes(myId)){
            return res.status(400).json({message:"you are alreday  friends"})
        }
        // check if already  request exist
        const existingRequest = await FriendRequest.findOne({
            $or:[{sender:myId, recipient:recipientId},{
                sender:recipientId, recipient:myId
            }]
        })
        if(existingRequest){
            return res.status(400).json({message:"there is already friend request exists between you and this user"})
        }
        const friendRequest = await FriendRequest.create({
            sender:myId,
            recipient:recipientId
        })
        res.status(201).json(friendRequest)
    } catch (error) {
        console.error("Error in the sedFriendRequest controller",error)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export async function acceptFriendRequest(req,res){
    try {
        const {id:requestId} = req.params
        const friendRequest = await FriendRequest.findById(requestId)
        if(!friendRequest){
            return res.staus(404).json({message:"Friend Request Not Found"})
        }
        //verify the current user is recipient
        if(friendRequest.recipient.toString()!== req.user.id){
         return res.status(403).json({messgae:"you are not authorized to accept this request"})   
        }
        friendRequest.status ="accepted"
        await friendRequest.save()
        // aading users to each friends array
        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet:{friends:friendRequest.recipient}
        })
        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{friends:friendRequest.sender}
        })
        res.status(200).json({message:"friend request accepted"})
    } catch (error) {
        console.error("Error in the acceptFriendRequest controller",error)
        res.staus(500).json({message:"Internal Server Error"})
    }
}

export async function getMyFriendRequests(req,res){
    try {
        const incomingReqs = await FriendRequest.find({
            recipient:req.user.id,
            status:"pending"
        }).populate("sender","fullName profilePic nativeLanguage learningLanguage")
        const acceptedReqs = await FriendRequest.find({
            sender:req.user.id,
            status:"accepted"
        }).populate("recipient","fullName profilePic")
        res.status(200).json({incomingReqs,acceptedReqs})
    } catch (error) {
        console.error("Error in the getMyFriendRequest controller ",error)
        res.status(500).json({message:"Internal Server Error"})
    }
}


export async function getOutgoingFriendRequests(req,res){
    try {
        const outgoingReuests = await FriendRequest.find({
            sender:req.user.id,
            status:"pending"
        }).populate("recipient","fullName profilePic nativeLanguage learningLanguage")
        res.status(200).json(outgoingReuests)
    } catch (error) {
        console.error("Error in the getOutgoingFriendRequests controller",error)
        res.status(500).json({message:"Internal Server Error"})
    }
}