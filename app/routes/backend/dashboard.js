var express = require('express');
var router = express.Router();

const folderView	 = __path_views + 'pages/dashboard/';
const ItemsModel 	= require(__path_schemas + 'items');
const SlidersModel 	= require(__path_schemas + 'sliders');


/* GET dashboard page. */
router.get('/', async(req, res, next) => {

	let countItems = 0;
	let countSliders = 0;
	await ItemsModel.count({}).then( (data) => {
		countItems = data;
		
	});
	await SlidersModel.count({}).then( (data1) => {
		
		countSliders = data1;
	});
	
	

	res.render(`${folderView}index`, { 
		pageTitle		: 'Dashboard Page', 
		countItems		: countItems,
		countSliders	: countSliders

		
	});
});




module.exports = router;
