const GroupsModel 	= require(__path_schemas + 'groups');

module.exports = {
    listItems:  (params) => {
        let objWhere = {};
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
	    if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        let sort 				= {};
	    sort[params.sortField]			= params.sortType;
        
        return GroupsModel
            .find(objWhere)
            .select('name status ordering created modified')
            .sort(sort)
            .skip((params.pagination.currentPage-1) * params.pagination.totalItemsPerPage)
            .limit(params.pagination.totalItemsPerPage)
    },

    listItemsInSelectbox:  (params , options  = null) => {
        return ItemsModel.find({} , {_id: 1 , name: 1})
    },

    getItem:  (id , options = null) => {
        return GroupsModel.findById(id);
    },

    countItems:  (params) => {
        return GroupsModel.count(params.objWhere);
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
            return GroupsModel.updateOne({_id: id} , data);
        }

        if (options.task == "update-multi") {
            data.status = currentStatus;
            return GroupsModel.updateMany({_id: {$in: id}} , data);
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
                        await GroupsModel.updateOne({_id: cids[index]} ,data )
                    }
                    return Promise.resolve("Success");
                }else{
                    return GroupsModel.updateOne({_id: cids} , data )
                }
	},

    deleteItem:  (id , options = null ) => {
        
        if (options.task == "delete-one") {
            return GroupsModel.deleteOne({_id: id});
        }

        if (options.task == "delete-multi") {
            return GroupsModel.remove({_id: {$in: id}} );
        }   
    },

    saveItem:  (item , options = null ) => {
        
        if (options.task == "add") {
            item.created = {
				user_id     	: 0,
				user_name   	: `admin`,
				time       		: Date.now()	
			}
            return new GroupsModel(item).save();
        }

        if (options.task == "edit") {
           return GroupsModel.updateOne({_id: item.id}, {
				    ordering: parseInt(item.ordering),
				    name				: item.name,
				    status				: item.status,
				    content 			: item.content,
				    modified			: {
                        user_id     : 0,
                        user_name   : 0,
                        time       : Date.now()
					}
            });
        }
    },

    changeGroups:  (currentGroups , id,  options = null ) => {
        
        let groups			= (currentGroups === "yes") ? "no" : "yes";
        let data 			= {
                groups		: groups,
                modified	: {
                    user_id     : 0,
                    user_name   : "admin",
                    time       : Date.now()
                }
            };
            
        return GroupsModel.updateOne({_id: id}, data);   
    }
}
 


