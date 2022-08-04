const { Schema, model } = require("mongoose");

module.exports.profiles = model("profiles", new Schema({
    _id: String,
    username: String,
    bio: String,
    age: Number,
    birthday: String,
    gender: String,
    country: String,
    following: Number,
    followers: Number,
    banner: String,
}));