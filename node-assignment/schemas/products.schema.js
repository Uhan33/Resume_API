import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['FOR_SALE', 'SOLD_OUT'],
        default: 'FOR_SALE',
    },
    createAt: {
        type: Date,
        required: false,
    },
});

export default mongoose.model('Product', ProductSchema);
