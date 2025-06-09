

import mongoose, { connect } from "mongoose"

export const connectDB  =   async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MONGODB CONNECT TO ${conn.connection.host}`)
    } catch (error) {
        console.log('Error in connecting with Mongodb',error)
        process.exit(1)
    }
}