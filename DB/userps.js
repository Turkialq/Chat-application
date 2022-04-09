const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userPasswordSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {timestamps: true});

const userPasswordModel = mongoose.model('userPasswordModel', userPasswordSchema);
exports = userPasswordModel;




