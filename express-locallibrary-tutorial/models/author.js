const mongoose = require('mongoose');
const {DateTime} = require("luxon");

const authorSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        maxLength: 100
    },
    family_name: {
        type: String,
        required: true,
        maxLength: 100
    },
    date_of_birth: Date,
    date_of_death: Date,
});

authorSchema.virtual("name").get(function() {
    console.log(this);
    return [this.family_name, this.first_name].join(", ")
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

authorSchema.virtual("lifespan").get(function() {
    let str_lifetime = "";
    if(this.date_of_birth) {
        let o = ordinal(DateTime.fromJSDate(this.date_of_birth));
        str_lifetime = DateTime.fromJSDate(this.date_of_birth).toFormat(`MMM d'${o}', yyyy`);
    }
    str_lifetime += " - ";
    if(this.date_of_death) {
        let o = ordinal(DateTime.fromJSDate(this.date_of_death));
        str_lifetime += DateTime.fromJSDate(this.date_of_death).toFormat(`MMM d'${o}', yyyy`);
    }
    return str_lifetime;
});

authorSchema.virtual("url").get(function() {
    return '/catalog/author/' + this._id;
});

authorSchema.virtual('date_of_birth_formatted').get(function() {
    let o = ordinal(DateTime.fromJSDate(this.date_of_birth));
    if(this.date_of_birth === undefined) return "N/A";
    return DateTime.fromJSDate(this.date_of_birth).toFormat(`MMM d'${o}', yyyy`);
});

authorSchema.virtual('date_of_death_formatted').get(function() {
    let o = ordinal(DateTime.fromJSDate(this.date_of_death));
    if(this.date_of_death === undefined) return "N/A";
    return DateTime.fromJSDate(this.date_of_death).toFormat(`MMM d'${o}', yyyy`);
});

module.exports = mongoose.model("Author", authorSchema);