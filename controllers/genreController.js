const Genre = require("../models/genre");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
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
            let err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });
};
exports.genre_create_get = (req, res) => {
    res.render("genre_form", { title: "Create Genre" })
};
exports.genre_create_post = [
    body('name', 'Genre name required')
        .trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        let genre = new Genre({
            name: req.body.name
        })

        if (!errors.isEmpty())
            return res.render(
                'genre_form',
                {
                    title: 'Create Genre',
                    genre: genre,
                    errors: errors.array()
                });
        else {
            Genre.findOne({ name: req.body.name })
                .exec(
                    (err, found_genre) => {
                        if (err) return next(err);
                        if (found_genre)
                            res.redirect(found_genre.url)
                        else
                            genre.save((err) => {
                                if (err) return next(err);
                                res.redirect(genre.url)
                            });
                    });
        }
    }
];

exports.genre_delete_get = (req, res, next) => {
    async.parallel({
        genre: (cb) => Genre
            .findById(req.params.id)
            .exec(cb),
        genre_books: (cb) => Book
            .find({ genre: req.params.id })
            .exec(cb)
    }, (err, results) => {
        if (err) return next(err);
        if (results.genre == null) res.redirect(`${req.protocol}://${req.get('host')}/catalog/genres`);
        res.render(
            'genre_delete',
            {
                title: "Delete Genre",
                genre: results.genre,
                genre_books: results.genre_books
            });
    });
}

exports.genre_delete_post = (req, res, next) => {
    async.parallel({
        genre: (cb) => Genre.findById(req.body.authorid).exec(cb),
        genres_books: (cb) => Book.find({ genre: req.body.authorid }).exec(cb)
    }, (err, results) => {
        if (err) return next(err);
        if (results.genres_books.length > 0)
            return res.render(
                'genre_delete',
                {
                    title: "Delete Genre",
                    genre: results.genre,
                    genre_books: results.genres_books
                });
        else
            Genre
                .findByIdAndRemove(req.body.genreid, (err) => {
                    if (err) return next(err);
                    res.redirect(`${req.protocol}://${req.get('host')}/catalog/genres`);
                });
    });
}

exports.genre_update_get = (req, res, next) => {
    Genre
        .findById(req.params.id)
        .exec((err, genre) => {
            if (err) return next(err);
            if (genre == null) {
                let err = new Error("Genre not found");
                err.status = 404;
                return next(err);
            }
            res.render(
                'genre_form',
                {
                    title: "Update Genre",
                    genre: genre
                });
        });
};

exports.genre_update_post = [
    body('name', 'Genre name required')
        .trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        let genre = new Genre({
            name: req.body.name,
            _id:req.params.id //This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            res.render(
                'genre_form',
                {
                    title: 'Update Genre',
                    genre: genre,
                    errors: errors.array()
                });
        }
        else {
            // Data from form is valid. Update the record.
            Genre
                .findByIdAndUpdate(req.params.id, genre, {}, function (err,thegenre) {
                    if (err) { return next(err); }
                    // Successful - redirect to book detail page.
                    res.redirect(thegenre.url);
                });
        }
    }
];