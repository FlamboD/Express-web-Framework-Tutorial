const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const async = require("async");

exports.bookinstance_list = (req, res) => {
    BookInstance
        .find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) { return next(err); }
            // Successful, so render
            res.render(
                'bookinstance_list',
                {
                    title: 'Book Instance List',
                    bookinstance_list: list_bookinstances
                });
        });
};
exports.bookinstance_detail = (req, res) => {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) return next(err);
            if (bookinstance==null) { // No results.
                let err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render(
                'bookinstance_detail',
                {
                    title: 'Copy: ' + bookinstance.book.title,
                    bookinstance:  bookinstance
                });
        });
};

exports.bookinstance_create_get = (req, res, next) => {
    Book.find({}, 'title')
        .exec((err, books) => {
            if (err) return next(err);
            res.render(
                'bookinstance_form',
                {
                    title: "Create Book Instance",
                    book_list: books
                });
        });
};

exports.bookinstance_create_post = [
    body('book', "Book must be specified")
        .trim().isLength({ min: 1 }).escape(),
    body('imprint', "Imprint must be specified")
        .trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', "Invalid date")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    (req, res, next) => {
        const errors = validationResult(req);

        let bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty())
            return Book.find({}, 'title')
                .exec((err, books) => {
                    if (err) return next(err);
                    res.render(
                        'bookinstance_form',
                        {
                            title: "Create Book Instance",
                            book_list: books,
                            selected_book: bookInstance.book._id,
                            errors: errors.array(),
                            bookinstance: bookInstance
                        });
                });
        else
            bookInstance.save((err) => {
                if (err) return next(err);
                res.redirect(bookInstance.url);
            });
    }
];

exports.bookinstance_delete_get = (req, res, next) =>
    BookInstance
        .findById(req.params.id)
        .populate('book')
        .exec((err, bookinstance) => {
            if (err) return next(err);
            res.render(
                'bookinstance_delete',
                {
                    title: "Delete Book Instance",
                    bookinstance: bookinstance
                });
        });

exports.bookinstance_delete_post = (req, res, next) => {
    BookInstance
        .findById(req.body.authorid)
        .exec((err) => {
            if (err) return next(err);
            BookInstance
                .findByIdAndRemove(req.body.bookinstanceid, (err) => {
                    if (err) return next(err);
                    res.redirect(`${req.protocol}://${req.get('host')}/catalog/bookinstances`);
                });
        });
}

exports.bookinstance_update_get = (req, res, next) => {
    async.parallel({
        bookinstance: (cb) => BookInstance
            .findById(req.params.id)
            .exec(cb),
        book_list: (cb) => Book
            .find({}, 'title')
            .exec(cb)
    }, (err, results) => {
        if (err) return next(err);
        if (results.bookinstance == null) {
            let err = new Error("Author not found");
            err.status = 404;
            return next(err);
        }
        res.render(
            'bookinstance_form',
            {
                title: "Update Book Instance",
                bookinstance: results.bookinstance,
                book_list: results.book_list
            });
    });
};

exports.bookinstance_update_post = [
    body('book', "Book must be specified")
        .trim().isLength({ min: 1 }).escape(),
    body('imprint', "Imprint must be specified")
        .trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', "Invalid date")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    (req, res, next) => {
        const errors = validationResult(req);

        let bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id:req.params.id //This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            res.render(
                'bookinstance_form',
                {
                    title: 'Update Book',
                    bookinstance: bookinstance,
                    errors: errors.array()
                });
        }
        else {
            // Data from form is valid. Update the record.
            BookInstance
                .findByIdAndUpdate(req.params.id, bookinstance, {}, function (err,thebookinstance) {
                    if (err) { return next(err); }
                    // Successful - redirect to book detail page.
                    res.redirect(thebookinstance.url);
                });
        }
    }
];