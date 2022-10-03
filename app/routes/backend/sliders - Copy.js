var express = require('express');
var router 	= express.Router();
const util = require('util');

const systemConfig  = require(__path_configs + 'system');
const notify  		= require(__path_configs + 'notify');
const ItemsModel 	= require(__path_schemas + 'sliders');
const ValidateItems	= require(__path_validates + 'sliders');
const UtilsHelpers 	= require(__path_helpers + 'sliders');
const ParamsHelpers = require(__path_helpers + 'params');


const linkIndex		 = '/' + systemConfig.prefixAdmin + '/sliders/';
const pageTitleIndex = 'Item Management';
const pageTitleAdd   = pageTitleIndex + ' - Add';
const pageTitleEdit  = pageTitleIndex + ' - Edit';
const folderView	 = __path_views + 'pages/sliders/';


// List items
router.get('(/status/:status)?', async (req, res, next) => {
	let params	 		= {};
	params.keyword		 		= ParamsHelpers.getParam(req.query, 'keyword', '');
	params.currentStatus		= ParamsHelpers.getParam(req.params, 'status', 'all'); 
	params.sortField			= ParamsHelpers.getParam(req.session, `sort_field`, `name`); 
	params.sortType				= ParamsHelpers.getParam(req.session, `sort_type`, `asc`); 

	params.pagination 	 = {
			totalItems		 : 1,
			totalItemsPerPage: 4,
			currentPage		 : parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
			pageRanges		 : 3
	};

	let statusFilter		= await UtilsHelpers.createFilterStatus(params.currentStatus , 'sliders');
	await ItemsModel.countItem(params).then( (data) => {
					params.pagination.totalItems = data;
				});

	ItemsModel.listItems(params)
			.then( (items) => {
				res.render(`${folderView}list`, { 
					pageTitle: pageTitleIndex,
					items,
					statusFilter,
					params
			});
		});
});

// Change status
router.get('/change-status/:id/:status', (req, res, next) => {
	let currentStatus	= ParamsHelpers.getParam(req.params, 'status', 'active'); 
	let id				= ParamsHelpers.getParam(req.params, 'id', ''); 
	let status			= (currentStatus === "active") ? "inactive" : "active";
	let data 			= {
		status		: status,
		modified	: {
			user_id     : 0,
			user_name   : 0,
			time       : Date.now()
		}
	};
	
	ItemsModel.updateOne({_id: id}, data, (err, result) => {
		req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
		res.redirect(linkIndex);
	});
});

// Change groups
router.get('/change-groups/:id/:groups', (req, res, next) => {
	let currentGroups	= ParamsHelpers.getParam(req.params, 'groups', 'yes'); 
	let id				= ParamsHelpers.getParam(req.params, 'id', ''); 
	let groups			= (currentGroups === "yes") ? "no" : "yes";
	let data 			= {
		groups		: groups,
		modified	: {
			user_id     : 0,
			user_name   : 0,
			time       : Date.now()
		}
	};
	
	ItemsModel.updateOne({_id: id}, data, (err, result) => {
		req.flash('success', notify.CHANGE_groups_SUCCESS, false);
		res.redirect(linkIndex);
	});
});

// Change status - Multi
router.post('/change-status/:status', (req, res, next) => {
	let currentStatus	= ParamsHelpers.getParam(req.params, 'status', 'active'); 
	ItemsModel.updateMany({_id: {$in: req.body.cid }}, {status: currentStatus}, (err, result) => {
		req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.n) , false);
		res.redirect(linkIndex);
	});
});

// Change ordering - Multi
router.post('/change-ordering', (req, res, next) => {
	let cids 		= req.body.cid;
	let orderings 	= req.body.ordering;
	
	if(Array.isArray(cids)) {
		cids.forEach((item, index) => {
			let data 			= {
				ordering		: parseInt(orderings[index]),
				modified		: {
					user_id     : 0,
					user_name   : 0,
					time       : Date.now()
				}
			};
			ItemsModel.updateOne({_id: item}, data, (err, result) => {});
		})
	}else{ 
		let data 			= {
			ordering		: parseInt(orderings[index]),
			modified		: {
				user_id     : 0,
				user_name   : 0,
				time       : Date.now()
			}
		};
		ItemsModel.updateOne({_id: cids}, data, (err, result) => {});
	}

	req.flash('success', notify.CHANGE_ORDERING_SUCCESS, false);
	res.redirect(linkIndex);
});

// Delete
router.get('/delete/:id', (req, res, next) => {
	let id				= ParamsHelpers.getParam(req.params, 'id', ''); 	
	ItemsModel.deleteOne({_id: id}, (err, result) => {
		req.flash('success', notify.DELETE_SUCCESS, false);
		res.redirect(linkIndex);
	});
});

// Delete - Multi
router.post('/delete', (req, res, next) => {
	ItemsModel.remove({_id: {$in: req.body.cid }}, (err, result) => {
		req.flash('success', util.format(notify.DELETE_MULTI_SUCCESS, result.n), false);
		res.redirect(linkIndex);
	});
});

// FORM
router.get(('/form(/:id)?'), (req, res, next) => {
	let id		= ParamsHelpers.getParam(req.params, 'id', '');
	let item	= {name: '', ordering: 0, status: 'novalue'};
	let errors   = null;
	if(id === '') { // ADD
		res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors});
	}else { // EDIT
		ItemsModel.findById(id, (err, item) =>{
			res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors});
		});	
	}
});

// SAVE = ADD EDIT
router.post('/save', (req, res, next) => {
	req.body = JSON.parse(JSON.stringify(req.body));
	ValidateItems.validator(req);

	let item = Object.assign(req.body);
	let errors = req.validationErrors();

	if(typeof item !== "undefined" && item.id !== "" ){	// edit
		if(errors) { 
			res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors});
		}else {
			ItemsModel.updateOne({_id: item.id}, {
				ordering: parseInt(item.ordering),
				name				: item.name,
				status				: item.status,
				content 			: item.content,
				modified			: {
					user_id     : 0,
					user_name   : 0,
					time       : Date.now()
					}
				
			}, (err, result) => {
				req.flash('success', notify.EDIT_SUCCESS, false);
				res.redirect(linkIndex);
			});
		}
	}else { // add
		if(errors) { 
			res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors});
		}else {
			item.created = {
				user_id     	: 0,
				user_name   	: `admin`,
				time       		: Date.now()
				
			}

			new ItemsModel(item).save().then(()=> {
				req.flash('success', notify.ADD_SUCCESS, false);
				res.redirect(linkIndex);
			})
		}
	}	
});

//---------SORT-------------

router.get(('/sort/:sort_field/:sort_type') , (req, res, next) => {
	req.session.sort_field		= ParamsHelpers.getParam(req.params, `sort_field`, `ordering`);
	req.session.sort_type 		= ParamsHelpers.getParam(req.params, `sort_type`, `asc`);
   
	res.redirect(linkIndex);
   });

module.exports = router;