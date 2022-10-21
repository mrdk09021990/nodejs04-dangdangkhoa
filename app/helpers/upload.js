const path = require('path');

var multer = require('multer');
var randomstring = require('randomstring');


let uploadFile =   () => {

	var storage = multer.diskStorage({
		destination :  (req ,file , cb ) => {
			cb(null , __path_public  + `uploads/items/`)
		},
		
		filename:  (req, file , cb) => {
			cb(null , randomstring.generate(7) + path.extname(file.originalname));
		}
	});
	
	var upload = multer ({
		storage: storage,
		limits: {
			fileSize: 1 * 1024 * 1024,
		},
		fileFilter:  (req , file , cb)  => {
			const fileTypes = new RegExp ('jpeg|jpg|png|gif');
			const extname 	= fileTypes.test(path.extname(file.originalname).toLowerCase());
			const mimetype 	= fileTypes.test(file.mimetype);
	
			if (mimetype && extname) {
				return cb (null , true);
			}else{
				cb (new Error ('file nay ko ho tro'))
			}
		}
	});
	
}

module.exports = {
    upload: uploadFile
}