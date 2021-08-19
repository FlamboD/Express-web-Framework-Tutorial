const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const bookInstanceSchema = mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    imprint: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["Available", "Maintenance", "Loaned", "Reserved"],
        default: "Maintenance"
    },
    due_back: {
        type: Date,
        default: Date.now
    },
});

bookInstanceSchema.virtual("url").get(function() {
    return '/catalog/bookinstance/' + this._id;
});

function ordinal(dt) {
    let unit = dt.day % 10;
    switch(unit)
    {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

bookInstanceSchema.virtual('due_back_formatted').get(function() {
    let o = ordinal(DateTime.fromJSDate(this.due_back));
    return DateTime.fromJSDate(this.due_back).toFormat(`MMM d'${o}', yyyy`);
});

module.exports = mongoose.model("BookInstance", bookInstanceSchema);