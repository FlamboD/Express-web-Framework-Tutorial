const Book = require("../models/book");
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

var async = require('async');

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
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance } );
    });
};
exports.book_create_get = (req, res) => res.send("NOT IMPLEMENTED: Book create GET");
exports.book_create_post = (req, res) => res.send("NOT IMPLEMENTED: Book create POST");
exports.book_delete_get = (req, res) => res.send("NOT IMPLEMENTED: Book delete GET");
exports.book_delete_post = (req, res) => res.send("NOT IMPLEMENTED: Book delete POST");
exports.book_update_get = (req, res) => res.send("NOT IMPLEMENTED: Book update GET");
exports.book_update_post = (req, res) => res.send("NOT IMPLEMENTED: Book update POST");