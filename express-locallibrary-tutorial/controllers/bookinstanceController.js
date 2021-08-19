const BookInstance = require("../models/bookinstance");

exports.bookinstance_list = (req, res) => {
    BookInstance
        .find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });
    // res.send("NOT IMPLEMENTED: BookInstance list")
};
exports.bookinstance_detail = (req, res) => {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function (err, bookinstance) {
            if (err) { return next(err); }
            if (bookinstance==null) { // No results.
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
        });
};
exports.bookinstance_create_get = (req, res) => res.send("NOT IMPLEMENTED: BookInstance create GET");
exports.bookinstance_create_post = (req, res) => res.send("NOT IMPLEMENTED: BookInstance create POST");
exports.bookinstance_delete_get = (req, res) => res.send("NOT IMPLEMENTED: BookInstance delete GET");
exports.bookinstance_delete_post = (req, res) => res.send("NOT IMPLEMENTED: BookInstance delete POST");
exports.bookinstance_update_get = (req, res) => res.send("NOT IMPLEMENTED: BookInstance update GET");
exports.bookinstance_update_post = (req, res) => res.send("NOT IMPLEMENTED: BookInstance update POST");