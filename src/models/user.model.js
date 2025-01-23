import mongoose, { Schema} from "mongoose";

const userSchema = new Schema(
    {

    username : {
        type : String,
        required : true,
        unique : true,
        lowercase: true,
        trim : true,
        index : true,
    },

    email : {
        type : String,
        required : true,
        unique : true,
        lowercase: true,
        trim : true,
    },
    

    fullname : {
        type : String,
        required : true,
        trim : true,
        index : true
    },

    avatar : {
        type : String,  // cloudnary
        required : true,
        

    },

    coverImage : {
        type : String,
    },

    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],

    password : {
        type : String,
        required : [true, "Password is required"]
    },

    refreshToken : {
        type : String,
    }



}, { timestamps: true});

userSchema.pre("save", async function (next) {

    if(!this.isModified("password")) return next();

    this.password = await bycrypt.hash(this.password, 10)
    next();
})


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bycrypt.compare(password, this.password)
}

// jwt is a bearer token, so we need to verify it, so we need to create a function to verify the token. go to 6 : 53 in video 

userSchema.methods.generateAccessToken = function () {

    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname
        },

        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}
userSchema.methods.generateRefreshToken = function () {

    return jwt.sign(
        {
            _id : this._id,
            
        },

        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )

}



export const User = mongoose.model("User", userSchema)