const mongoose = require('mongoose');
const databaseConfig = require(__path_configs + 'database');

var schema = new mongoose.Schema({ 
    name        : String, 
    status      : String,
    ordering    : Number,
    content     : String,
    groups_acp     : String,
    slug : String,
    created: {
        user_id     : Number,
        user_name   : String,
        time       : Date
    },
    modified: {
        user_id     : Number,
        user_name   : String,
        time       : Date
    }
});

module.exports = mongoose.model(databaseConfig.col_category , schema );