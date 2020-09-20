var router = require("express").Router();
router.get('/', function (req, res) {
    res.render('index');
});

router.get('/product.html', function (req, res) {
    res.render('product');
});

router.get('/detail.html', function (req, res) {
    res.render('detail');
});

router.get('/service.html', function (req, res) {
    res.render('service');
});

router.get('/about.html', function (req, res) {
	res.render('about');
});

router.get('/contact.html', function (req, res) {
    res.render('contact');
});





router.get('/login.html', function (req, res) {
    res.render('login');
});

router.get('/register.html', function (req, res) {
    res.render('register');
});

router.get('/agreement.html', function (req, res) {
    res.render('agreement');
});



router.get('/auth.html', function (req, res) {
	res.render('auth');
});
router.get('/help.html', function (req, res) {
	res.render('help');
});
router.get('/about.html', function (req, res) {
	res.render('about');
});
router.get('/personal.html', function (req, res) {
	res.render('personal');
});
router.get('/myOrder.html', function (req, res) {
	res.render('myOrder');
});
module.exports = router;
