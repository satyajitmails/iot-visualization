var express = require('express');
var router = express.Router();

var api_routes = require('./api');
var dashboard_routes = require('./dashboard');
var auth_routes = require('./auth');

//all requests come here to validate the if api key is present
//else redirect to login
router.use(function(req, res, next) {

	if(! req.session.api_key && req.path.indexOf('login') === -1) {
		res.redirect("/login");
	} else {
		next();
	}
});

//manage login routes
router.use('/',auth_routes);
//dashboard routes
router.use('/dashboard', dashboard_routes);
//proxy api routes TODO: remove this after datapower handles the CORS requests
router.use('/api',api_routes);


module.exports = router;