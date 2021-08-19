// var mongoose = require('mongoose');
//
// //Set up default mongoose connection
// var mongoDB = 'mongodb://127.0.0.1/my_database';
// mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
//
// //Get the default connecdction
// var db = mongoose.connection;
//
// const Book = mongoose.model('Book', { title: String, author: String });
// const _b = new Book({ title:"Some", author:"Book" });
// _b.save().then(() => console.log("saved"));
// const book = Book.findOne();
// console.log(book);
//
// //Bind connection to error event (to get notification of connection errors)
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//
// console.log("Running mongoose db");
//
// module.exports = db;