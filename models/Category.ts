import mongoose, { models, Schema } from "mongoose";

const CategorySchema = new Schema({
    name: {type: String, required: true, unique: true},
    position : {type: Number, required: true}
}, {
    timestamps: true
});

export const Category = models.Category || mongoose.model('Category', CategorySchema);