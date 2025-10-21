import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema({
    userquery: { type: String, required: true },
    airesponse: { type: String },
    type: { type: String },
    data: { type: Object },
    createdAt: { type: Date, default: Date.now },

}, { timestamps: true });
const AIModel = mongoose.model('AIModel', aiModelSchema);

export default AIModel;