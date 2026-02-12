import mongoose, {Schema, models} from "mongoose";

const ProductSchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true, min: 0},
    description: String,
    image: {type: String, required: true},

    category: {type: String, required: true},

    isBestSeller: {type: Boolean, default: false},
    stock: {type: Number, default: 0}
},
{timestamps: true}
);

export const Product = models.Product || mongoose.model("Product", ProductSchema)