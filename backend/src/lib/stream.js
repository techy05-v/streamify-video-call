
import { StreamChat } from "stream-chat"
import dotenv from "dotenv"
dotenv.config()
const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

if (!apiKey || !apiSecret) {
    console.error("the stream api KEY or SECRET is missing")

}
const streamClient = StreamChat.getInstance(apiKey, apiSecret)

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData)
        return userData
    } catch (error) {
        console.error("error in creating stream user ", error)
    }
}

export const generateStreamToken = async (userId) => {
    try {
        const userIdstr = userId.toString()
        return streamClient.createToken(userIdstr)
    } catch (error) {
        console.error("Error in generating Stream Token:",error)
    }
}