const mongoose = require('mongoose');

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

authorSchema.virtual("lifespan").get(function() {
    let str_lifetime = "";
    if(this.date_of_birth) {
        str_lifetime = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }
    str_lifetime += " - ";
    if(this.date_of_death) {
        str_lifetime = DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    }
    return str_lifetime;
});
authorSchema.virtual("url").get(function() {
    return '/catalog/author/' + this._id;
});


module.exports = mongoose.model("Author", authorSchema);