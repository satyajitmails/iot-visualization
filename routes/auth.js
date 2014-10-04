var express = require('express');
var router = express.Router();

/* GET realtime page. */
router.get('/login', function(req, res) {
  res.render('login', { title: 'IBM Internet of Things Foundation' });
});

router.post('/login', function(req, res) {
  console.log("Logged in using api key : "+req.body.api_key);

  req.session.api_key = req.body.api_key;
  req.session.auth_token = req.body.auth_token;

  res.redirect("/dashboard");
});

// Logout the user, then redirect to the home page.
router.post('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;