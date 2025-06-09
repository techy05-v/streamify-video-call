
import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    bio: {
        type: String,
        default: ""
    },
    profilePic: {
        type: String,
        default: ""
    },
    nativeLanguage: {
        type: String,
        default: ""
    },
    learningLanguage: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    isOnboarded: {
        type: Boolean,
        default: false
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true })


// pre hook

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    try {

        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()

    } catch (error) {
        next(error)
    }
})
// userSchema.methods.matchPassword = async function (enteredPassword) {
//     console.log("the entered password is ",enteredPassword)
//     const isPasswordcorrect = await bcrypt.compare(enteredPassword, this.password)
//     console.log("the password correct",isPasswordcorrect)
//     return isPasswordcorrect
// }

userSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        console.log("Entered password:", enteredPassword);
        console.log("Stored hash:", this.password);
        
        const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
        console.log("Password comparison result:", isPasswordCorrect);
        
        return isPasswordCorrect;
    } catch (error) {
        console.error("Error comparing passwords:", error);
        return false;
    }
};

const User = mongoose.model("User", userSchema)
export default User