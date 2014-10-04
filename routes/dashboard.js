var express = require('express');
var router = express.Router();

/* GET realtime page. */
router.get('/', function(req, res) {

	res.render('dashboard', { title: 'IBM Internet of Things Foundation' });
});


module.exports = router;