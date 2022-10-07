const ItemsModel        = require(__path_schemas  +  'sliders');

module.exports = {
    listItems: (params) => {
        let objWhere         = {};
        if(params.currentStatus !== 'all')  objWhere.status     = params.currentStatus;
	    if(params.keyword !== '')           objWhere.name       = new RegExp(keyword, 'i');
        let sort 				        = {};
	    sort[params.sortField]			= params.sortType;
        
        return  ItemsModel
		        .find(objWhere)
                .select('name status ordering created modified' )
		        .sort(sort)
		        .skip((params.pagination.currentPage-1) * params.pagination.totalItemsPerPage)
		        .limit(params.pagination.totalItemsPerPage);
    },

    getItems: (params) => {
      
    },

    countItem: (params) => {
        return ItemsModel.count(params.objWhere);
    },
}