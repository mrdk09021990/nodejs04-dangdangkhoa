
const folderView	 = __path_views + 'pages/dashboard/';
const ItemsModel 	= require(__path_schemas + 'items');

const dashboardController =async(req, res, next) =>{
    let countItems = 0;
	await ItemsModel.count({}).then( (data) => {
		countItems = data;
	});

	res.render(`${folderView}index`, { 
		pageTitle: 'Dashboard Page', 
		countItems:countItems
	});
}

module.exports = dashboardController;