var express = require('express');
const { Collection } = require('mongoose');
var router 	= express.Router();
const util = require('util');
const modelName = 'groups';

const systemConfig  = require(__path_configs + 'system');
const notify  		= require(__path_configs + 'notify');
const ItemsModel 	= require(__path_models + modelName);
const ValidateItems	= require(__path_validates + modelName);
const UtilsHelpers 	= require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');


const linkIndex		 = '/' + systemConfig.prefixAdmin + `/${modelName}/`;
const pageTitleIndex = 'Groups Management';
const pageTitleAdd   = pageTitleIndex + ' - Add';
const pageTitleEdit  = pageTitleIndex + ' - Edit';
const folderView	 = __path_views + `pages/${modelName}/`;

// List items
router.get('(/status/:status)?', async (req, res, next) => {
	let params	 		= {};
	let objWhere	 		= {};
	params.keyword				= ParamsHelpers.getParam(req.query, 'keyword', '');
	params.currentStatus		= ParamsHelpers.getParam(req.params, 'status', 'all'); 
	params.sortField			= ParamsHelpers.getParam(req.session, `sort_field`, `name`); 
	params.sortType				= ParamsHelpers.getParam(req.session, `sort_type`, `asc`); 
	
	params.pagination 	 = {
		totalItems		 : 1,
		totalItemsPerPage: 4,
		currentPage		 : parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
		pageRanges		 : 3
	};

	let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus , modelName)
	await ItemsModel.countItems(params).then( (data) => {
		params.pagination.totalItems = data;
	});
	
	ItemsModel.listItems(params)
		.then((items) => {
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
	
		ItemsModel.changeStatus( id , currentStatus , {task: "update-one"} ).then((result)  => {
			req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
			res.redirect(linkIndex);
		});
});

// Change status - Multi
router.post('/change-status/:status', (req, res, next) => {
	let currentStatus	= ParamsHelpers.getParam(req.params, 'status', 'active'); 
	
	ItemsModel.changeStatus(req.body.cid , currentStatus , {task: "update-multi"}).then((result) => {
		req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.n) , false);
		res.redirect(linkIndex);
	});
});

// Change ordering - Multi
router.post('/change-ordering', (req, res, next) => {
	let cids 		= req.body.cid;
	let orderings 	= req.body.ordering;
	
			ItemsModel.changeOrdering(cids , orderings , null).then((result) => {
				req.flash('success', notify.CHANGE_ORDERING_SUCCESS, false);
				res.redirect(linkIndex);
			});
});

// Delete
router.get('/delete/:id', (req, res, next) => {
	let id				= ParamsHelpers.getParam(req.params, 'id', ''); 	
	ItemsModel.deleteItem( id , {task: 'delete-one'}).then((result) => {
		req.flash('success', notify.DELETE_SUCCESS, false);
		res.redirect(linkIndex);
	});
});

// Delete - Multi
router.post('/delete', (req, res, next) => {
	ItemsModel.deleteItem(req.body.cid , {task: 'delete-multi'}).then((result) => {
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
		ItemsModel.getItem(id).then((item) =>{
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
			ItemsModel.saveItem(item , {task: 'edit'}).then((result) => {
				req.flash('success', notify.ADD_SUCCESS, false);
				res.redirect(linkIndex);
			});
		}
	}else { // add
		if(errors) { 
			res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors});
		}else {
			ItemsModel.saveItem(item , {task: 'add'}).then(()=> {
				req.flash('success', notify.ADD_SUCCESS, false);
				res.redirect(linkIndex);
			})
		}
	}	
});

// Change groups-acp
router.get('/change-groups-acp/:id/:groups_acp', (req, res, next) => {
	let currentGroupACP	= ParamsHelpers.getParam(req.params, 'groups_acp', 'yes'); 
	let id				= ParamsHelpers.getParam(req.params, 'id', ''); 
	
	ItemsModel.changeGroupACP(currentGroupACP , id , null).then((result) => {
		req.flash('success', notify.CHANGE_GROUP_ACP_SUCCESS, false);
		res.redirect(linkIndex);
	});
});

module.exports = router;
