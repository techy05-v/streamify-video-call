
import { generateStreamToken } from "../lib/stream.js";


export async function getStreamToken(req, res){
    try {
        const token = await generateStreamToken(req.user.id)
        console.log("Generated token:", token); // Debug log
        console.log("Token type:", typeof token); // Debug log
        
        // Ensure token is a string
        if (typeof token !== 'string') {
            console.error("Token is not a string:", token);
            return res.status(500).json({message: "Invalid token format"});
        }
        
        res.status(200).json({token})
    } catch (error) {
        console.error("Error in the getStreamToken controller", error)
        res.status(500).json({message:"Internal Server Error"}) // Fixed: was res.staus(500)
    }
}