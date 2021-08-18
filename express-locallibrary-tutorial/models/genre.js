const mongoose = require('mongoose');

const genreSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
});

genreSchema.virtual("url").get(function() {
    return '/catalog/genre' + this._id;
});

module.exports = mongoose.model("Genre", genreSchema);