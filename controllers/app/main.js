const router = require('express').Router();

router.route('/')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render("app/index", {
                user: req.user
            });
        } else {
            req.flash('error_messages', "Necesita Iniciar Sesión");
            res.redirect('/user/login');
        }
    });

module.exports = router;