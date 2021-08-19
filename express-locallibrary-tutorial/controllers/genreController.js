const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");

exports.genre_list = (req, res, next) => {
    Genre
        .find()
        .sort([['name', 'ascending']])
        .exec((err, list_genres) => {
            if (err) next(err);
            res.render('genre_list', { title:'Genre List', genre_list:list_genres })
        })
};

exports.genre_detail = (req, res, next) => {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },

        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
                .exec(callback);
        },

    }, function(err, results) {
        if (err) return next(err);
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });
};
exports.genre_create_get = (req, res) => res.send("NOT IMPLEMENTED: Genre create GET");
exports.genre_create_post = (req, res) => res.send("NOT IMPLEMENTED: Genre create POST");
exports.genre_delete_get = (req, res) => res.send("NOT IMPLEMENTED: Genre delete GET");
exports.genre_delete_post = (req, res) => res.send("NOT IMPLEMENTED: Genre delete POST");
exports.genre_update_get = (req, res) => res.send("NOT IMPLEMENTED: Genre update GET");
exports.genre_update_post = (req, res) => res.send("NOT IMPLEMENTED: Genre update POST");