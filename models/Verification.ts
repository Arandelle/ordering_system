import mongoose, {models, Schema} from "mongoose";

const VerificationSchema = new Schema({
    _id:{
        type:String,
        require:true,
        trim:true
    },
    identifier:{
        type: String,
        require:true,
        trim:true
    },
    value:{
        type:String,
        require:true,
        trim:true
    },
    expiresAt:{
        type:Date,
        require:true
    },
    createdAt:{
        type:Date,
        require:true
    },
    updatedAt:{
        type:Date,
        require:true
    },
})

export const Verification =models.Verification || mongoose.model("Verification", VerificationSchema);