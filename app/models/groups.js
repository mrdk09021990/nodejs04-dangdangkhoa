const GroupModel 	= require(__path_schemas + 'groups');

module.exports = {
    listItems:  (params , option = null) => {
        let objWhere = {};
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
	    if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        let sort 				= {};
	    sort[params.sortField]			= params.sortType;
        
        return GroupModel
            .find(objWhere)
            .select('name status ordering created modified')
            .sort(sort)
            .skip((params.pagination.currentPage-1) * params.pagination.totalItemsPerPage)
            .limit(params.pagination.totalItemsPerPage)
    },

    getItem:  (id , options = null) => {
        return GroupModel.findById(id);
    },

    countItems:  (params , option = null) => {
        return GroupModel.count(params.objWhere);
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
            data.status = status;
            return GroupModel.updateOne({_id: id} , data);
        }

        if (options.task == "update-multi") {
            data.status = currentStatus;
            return GroupModel.updateMany({_id: {$in: id}} , data);
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
                        await GroupModel.updateOne({_id: cids[index]} ,data )
                    }
                    return Promise.resolve("Success");
                }else{
                    return GroupModel.updateOne({_id: cids} , data )
                }
	},

    deleteItem:  ( id , options = null ) => {
       
		if (options.task == "delete-one") {
            return GroupModel.deleteOne({_id: id});
        }

        if (options.task == "delete-multi") {
            return GroupModel.remove({_id: {$in: id}});
        }  
	},

    saveItem:  ( item , options = null ) => {
		if (options.task == "add") {
                item.created = {
                    user_id     : 0,
                    user_name   : "admin",
                    time       : Date.now()
            }
            return new GroupModel(item).save();
        }
        if (options.task == "edit") {
            return GroupModel.updateOne({_id: item.id} , {
				ordering: parseInt(item.ordering),
				name			: item.name,
				content			: item.content,
				status			: item.status,
                groups_acp     	: item.groups_acp,
				modified: {
					user_id     : 0,
					user_name   : 0,
					time       : Date.now()
				}
            });
        }
    },

    changeGroupACP:  ( currentGroupACP , id  , options = null ) => {

        let groupACP		= (currentGroupACP === "yes") ? "no" : "yes";
        let data			={	
                groups_acp     	: groupACP,
                modified: {
                    user_id     : 0,
                    user_name   : 0,
                    time       : Date.now()
                    }
                }
        
        return GroupModel.updateOne({_id: id}, data );
    },
}
