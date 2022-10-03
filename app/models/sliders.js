const ItemsModel 	= require(__path_schemas + 'sliders');

module.exports = {
    listItems:  (params) => {
        let objWhere = {};
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
	    if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        let sort 				= {};
	    sort[params.sortField]			= params.sortType;
        
        return ItemsModel
            .find(objWhere)
            .select('name status ordering created modified')
            .sort(sort)
            .skip((params.pagination.currentPage-1) * params.pagination.totalItemsPerPage)
            .limit(params.pagination.totalItemsPerPage)
    },

    getItem:  (params) => {

    },

    countItems:  (params) => {
        return ItemsModel.count(params.objWhere);
    },

    changeStatus:  (id , currentStatus , options = null ) => {
        let status			= (currentStatus === "active") ? "inactive" : "active";
	    let data 			= {
		        status		: status,
		        modified	: {
			        user_id     : 0,
			        user_name   : 0,
			        time        : Date.now()
		}
	}
        if (options.task == "update-one") {
            return ItemsModel.updateOne({_id: id} , data);
        }

        if (options.task == "update-multi") {
            data.status = currentStatus;
            return ItemsModel.updateMany({_id: {$in: id}} , data);
        }   
    }, 

    changeOrdering:  async (cids , orderings , options = null ) => {
       
		let data = {
			ordering		: parseInt(orderings),
			modified		: {
				user_id     : 0,
				user_name   : 0,
				time        : Date.now()
                }
		    };
                if(Array.isArray(cids)) {
                    for(let index = 0 ; index < cids.length ; index++) {
                        data.ordering =  parseInt(orderings[index]);
                        await ItemsModel.updateOne({_id: cids[index]} ,data )
                    }
                    return Promise.resolve("Success");
                }else{
                    return ItemsModel.updateOne({_id: cids} , data )
                }
	}
}



