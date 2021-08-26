const Book = require("../models/book");
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const { body, validationResult} = require("express-validator");
const async = require('async');

exports.index = (req, res) => {
    async.parallel(
        {
            book_count: (cb) => Book.countDocuments({}, cb),
            book_instance_count: (cb) => BookInstance.countDocuments({}, cb),
            book_instance_available_count: (cb) => BookInstance.countDocuments({ status: 'Available' }, cb),
            author_count: (cb) => Author.countDocuments({}, cb),
            genre_count: (cb) => Genre.countDocuments({}, cb),
        },
        (err, results) => res.render(
            'index',
            {
                title: 'Local Library Home',
                error: err,
                data: results
            })
    );
};

exports.book_list = (req, res, next) => {
    Book.find(
        {},
        'title author'
    )
        .populate('author')
        .exec(
            (err, list_books) => {
            if(err) return next(err);
            //Successful, so render
            res.render(
                'book_list',
                {
                    title: 'Book List',
                    book_list: list_books
                });
        });
};

exports.book_detail = (req, res, next) => {
    async.parallel({
        book: function(callback) {

            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instance: function(callback) {

            BookInstance.find({ 'book': req.params.id })
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance } );
    });
};

exports.book_create_get = (req, res) => {
    async.parallel({
        authors: (cb) => { Author.find(cb); },
        genres: (cb) => { Genre.find(cb); },
    },
        (err, results) => {
        if (err) return next(err);
        res.render('book_form', { title: "Create Book", authors: results.authors, genres: results.genres });
        });
};

exports.book_create_post = [
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = []
            else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },
    body('title', "Title must not be empty.")
        .trim().isLength({ min: 1 }).escape(),
    body('author', "Author must not be empty.")
        .trim().isLength({ min: 1 }).escape(),
    body('summary', "Summary must not be empty.")
        .trim().isLength({ min: 1 }).escape(),
    body('isbn', "ISBN must not be empty.")
        .trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        console.log(req.body);
        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });
        if(!errors.isEmpty())
            return async.parallel({
                authors: (cb) => { Author.find(cb); },
                genres: (cb) => { Genre.find(cb); },
            },
                (err, results) => {
                    if (err) return next(err);
                    for(let i = 0; i < results.genres.length; i++)
                        if (book.genre.indexOf(results.genres[i]._id > -1))
                            results.genres[i].checked = true;
                    res.render(
                        'book_form',
                        {
                            title: "Create Book",
                            authors: results.authors,
                            genres: results.genres,
                            book: book,
                            errors: errors.array()
                        });
                });
        else {
            book.save((err) => {
                if (err) return next(err);
                res.redirect(book.url);
            });
        }
    }
];

exports.book_delete_get = (req, res, next) => {
    async.parallel({
            book: (cb) => Book
                .findById(req.params.id)
                .exec(cb),
            bookinstances: (cb) => BookInstance
                .find({ book: req.params.id})
                .exec(cb)
        },
        (err, results) => {
            if (err) return next(err);
            if (results.book == null) res.redirect(`${req.protocol}://${req.get('host')}/catalog/books`);
            res.render(
                'book_delete',
                {
                    title: "Delete Book",
                    book: results.book,
                    bookinstances: results.bookinstances
                });
        });
}

exports.book_delete_post = (req, res, next) => {
    async.parallel({
        book: (cb) => Book
            .findById(req.body.bookid)
            .exec(cb),
        bookinstances: (cb) => BookInstance
            .find({ book: req.body.bookid })
            .exec(cb)
    }, (err, results) => {
        if (err) return next(err);
        if (results.bookinstances.length > 0)
            return res.render(
                'book_delete',
                {
                    title: "Delete Book",
                    book: results.book,
                    bookinstances: results.bookinstances
                });
        else
            Book
                .findByIdAndRemove(req.body.bookid, (err) => {
                    if (err) return next(err);
                    res.redirect(`${req.protocol}://${req.get('host')}/catalog/books`);
                });
    });
}

exports.book_update_get = (req, res, next) => {
    async.parallel({
        book: (cb) => Book
            .findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(cb),
        authors: (cb) => Author.find(cb),
        genres: (cb) => Genre.find(cb)
    }, (err, results) => {
        if (err) return next(err);
        if (results.book == null) {
            let err = new Error("Book not found");
            err.status = 404;
            return next(err);
        }
        for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++)
            for (let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++)
                if (results.genres[all_g_iter]._id.toString() === results.book.genre[book_g_iter]._id.toString())
                    results.genres[all_g_iter].checked = true
        res.render(
            'book_form',
            {
                title: "Update Book",
                authors: results.authors,
                genres: results.genres,
                book: results.book
            });
    });
};

exports.book_update_post = [
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)) {
            if(typeof req.body.genre === 'undefined')
                req.body.genre = [];
            else
                req.body.genre = new Array(req.body.genre);
        }
    },
    body('title', 'Title must not be empty.')
        .trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.')
        .trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.')
        .trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty')
        .trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            async.parallel({
                authors: (cb) => Author.find(cb),
                genres: (cb) => Genre.find(cb)
            }, (err, results) => {
                if (err) return next(err);
                for(let i = 0; i < results.genres.length;  i++)
                    if (book.genre.indexOf(results.genres[i]._id) > -1)
                        results.genres[i].checked = true;

                res.render(
                    'book_form',
                    {
                        title: 'Update Book',
                        authors: results.authors,
                        genres: results.genres,
                        book: book,
                        errors: errors.array()
                    });
            });
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thebook.url);
            });
        }
    }
];