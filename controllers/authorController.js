const Author = require("../models/author");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");
const async = require("async");

exports.author_list = (req, res, next) => {
    Author
        .find()
        .sort([['family-name', 'ascending']])
        .exec(
            (err, list_authors) => {
                if(err) return next(err);
                res.render('author_list', { title: 'Author List', author_list: list_authors });
            });
};

exports.author_detail = (req, res, next) => {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
                .exec(callback)
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id },'title summary')
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.author==null) { // No results.
            let err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });
};

exports.author_create_get = (req, res) => {
    res.render("author_form", { title: "Create Author" });
};

exports.author_create_post = [
    body("first_name")
        .trim()
        .isLength({ min: 1 }).escape().withMessage("First name must be specified.")
        .isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body("family_name")
        .trim()
        .isLength({ min: 1 }).escape().withMessage("Family name must be specified.")
        .isAlphanumeric().withMessage("Family name has non-alphanumeric characters."),
    body('date_of_birth', "Invalid date of birth")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    body('date_of_death', "Invalid date of death")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.render('author_form', { title: "Create Author", author: req.body, errors: errors.array() });
        else {
            let author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
            author.save(
                (err) => {
                    if (err) return next(err);
                    res.redirect(author.url);
                });
        }
    }
];

exports.author_delete_get = (req, res, next) => {
    async.parallel({
            author: (cb) => Author
                .findById(req.params.id)
                .exec(cb),
            authors_books: (cb) => Book
                .find({ author: req.params.id})
                .exec(cb)
        },
        (err, results) => {
            if (err) return next(err);
            if (results.author == null) res.redirect(`${req.protocol}://${req.get('host')}/catalog/authors`);
            res.render(
                'author_delete',
                {
                    title: "Delete Author",
                    author: results.author,
                    author_books: results.authors_books
                });
        });
}

exports.author_delete_post = (req, res, next) => {
    async.parallel({
        author: (cb) => Author
            .findById(req.body.authorid)
            .exec(cb),
        authors_books: (cb) => Book
            .find({ author: req.body.authorid })
            .exec(cb)
    }, (err, results) => {
        if (err) return next(err);
        if (results.authors_books.length > 0)
            return res.render(
                'author_delete',
                {
                    title: "Delete Author",
                    author: results.author,
                    author_books: results.authors_books
                });
        else
            Author
                .findByIdAndRemove(req.body.authorid, (err) => {
                    if (err) return next(err);
                    res.redirect(`${req.protocol}://${req.get('host')}/catalog/authors`);
                });
    });
}

exports.author_update_get = (req, res, next) => {
    Author
        .findById(req.params.id)
        .exec((err, author) => {
            if (err) return next(err);
            if (author == null) {
                let err = new Error("Author not found");
                err.status = 404;
                return next(err);
            }
            res.render(
                'author_form',
                {
                    title: "Update Author",
                    author: author
                });
        });
};

exports.author_update_post = [
    body("first_name")
        .trim()
        .isLength({ min: 1 }).escape().withMessage("First name must be specified.")
        .isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body("family_name")
        .trim()
        .isLength({ min: 1 }).escape().withMessage("Family name must be specified.")
        .isAlphanumeric().withMessage("Family name has non-alphanumeric characters."),
    body('date_of_birth', "Invalid date of birth")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    body('date_of_death', "Invalid date of death")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),
    (req, res, next) => {
        const errors = validationResult(req);

        let author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id:req.params.id //This is required, or a new ID will be assigned!
        });

        if (!errors.isEmpty()) {
            res.render(
                'author_form',
                {
                    title: 'Update Book',
                    author: author,
                    errors: errors.array()
                });
        }
        else {
            // Data from form is valid. Update the record.
            Author
                .findByIdAndUpdate(req.params.id, author, {}, function (err,theauthor) {
                    if (err) { return next(err); }
                    // Successful - redirect to book detail page.
                    res.redirect(theauthor.url);
                });
        }
    }
];