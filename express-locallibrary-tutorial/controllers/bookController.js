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

exports.book_detail = (req, res) => res.send("NOT IMPLEMENTED: Book detail: " + req.params.id);
exports.book_create_get = (req, res) => res.send("NOT IMPLEMENTED: Book create GET");
exports.book_create_post = (req, res) => res.send("NOT IMPLEMENTED: Book create POST");
exports.book_delete_get = (req, res) => res.send("NOT IMPLEMENTED: Book delete GET");
exports.book_delete_post = (req, res) => res.send("NOT IMPLEMENTED: Book delete POST");
exports.book_update_get = (req, res) => res.send("NOT IMPLEMENTED: Book update GET");
exports.book_update_post = (req, res) => res.send("NOT IMPLEMENTED: Book update POST");