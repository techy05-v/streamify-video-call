import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window
} from "stream-chat-react"
import { StreamChat } from "stream-chat"
import useAuthUser from '../hook/useAuthUser';
import ChatLoader from '../components/ChatLoader.jsx';
import { getStreamToken } from '../lib/api.js';
import CallButton from '../components/CallButton.jsx';
import toast from 'react-hot-toast';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const ChatPage = () => {
  const { id: targetUserId } = useParams()
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { authUser } = useAuthUser()
  
  // Add debugging logs
  console.log("ChatPage render - authUser:", authUser)
  console.log("ChatPage render - targetUserId:", targetUserId)
  console.log("ChatPage render - STREAM_API_KEY:", STREAM_API_KEY)

  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser // this will run only when authUser is available
  })

  console.log("Token data:", tokenData)
  console.log("Token loading:", tokenLoading)
  console.log("Token error:", tokenError)

  useEffect(() => {
    const initChat = async () => {
      // Add more specific checks
      if (!authUser) {
        console.log("No authUser available")
        return;
      }
      
      if (!targetUserId) {
        console.log("No targetUserId available")
        setError("Target user ID is missing")
        setLoading(false)
        return;
      }
      
      if (!STREAM_API_KEY) {
        console.log("No Stream API key available")
        setError("Stream API key is missing")
        setLoading(false)
        return;
      }
      
      if (!tokenData?.token) {
        console.log("No token available yet")
        return;
      }

      try {
        console.log("Initializing stream chat client...")
        
        // Check if client already exists and disconnect it first
        const existingClient = StreamChat.getInstance(STREAM_API_KEY)
        if (existingClient.user) {
          console.log("Disconnecting existing client...")
          await existingClient.disconnectUser()
        }

        const client = StreamChat.getInstance(STREAM_API_KEY)
        
        console.log("Connecting user with data:", {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic
        })

        await client.connectUser({
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic
        }, tokenData.token)

        console.log("User connected successfully")

        const channelId = [authUser._id, targetUserId].sort().join("-")
        console.log("Creating channel with ID:", channelId)
        
        const currentChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId]
        })
        
        console.log("Watching channel...")
        await currentChannel.watch();
        console.log("Channel watched successfully")

        setChatClient(client)
        setChannel(currentChannel)
        setError(null)
      } catch (error) {
        console.error("Error initializing chat:", error)
        setError(`Could not connect to chat: ${error.message}`)
        // Uncomment if you have toast
        // toast.error("Could not connect to chat. Please try again")
      } finally {
        setLoading(false)
      }
    }
    
    initChat()
  }, [tokenData, authUser, targetUserId, STREAM_API_KEY])

  const handleVideoCall =()=>{
    if(channel){
      const callUrl = `${window.location.origin}/call/${channel.id}`

      channel.sendMessage({
        text:`I have started a video call.Join me here :${callUrl}`
      })
      toast.success("video call started")
    }
  }

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (chatClient) {
        console.log("Cleaning up chat client...")
        chatClient.disconnectUser()
      }
    }
  }, [chatClient])

  // Show error state
  if (error) {
    return (
      <div className="h-[93vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Chat Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show loading state with more info
  if (loading || !chatClient || !channel || tokenLoading) {
    return (
      <div className="h-[93vh] flex items-center justify-center">
        <div className="text-center">
          <ChatLoader />
          <p className="mt-4 text-sm text-gray-500">
            {!authUser && "Loading user data..."}
            {authUser && tokenLoading && "Getting chat token..."}
            {authUser && !tokenLoading && tokenData && "Connecting to chat..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='h-[93vh]'>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className='w-full relative'>
            <CallButton handleVideoCall={handleVideoCall}/>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread/>
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage