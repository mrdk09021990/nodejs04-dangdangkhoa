const express = require('express');
const router = express.Router();
const dashboardController = require('./controller');


/* GET dashboard page. */
router.get('/', async(req, res, next) => {
	await dashboardController(req, res, next)
});

module.exports = router;
