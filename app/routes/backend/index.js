var express = require('express');
var router = express.Router();

router.use('/', require('./home'));
router.use('/dashboard', require('./dashboard/router'));
router.use('/items', require('./items'));
router.use('/sliders', require('./sliders'));
router.use('/khoa', require('./khoa'));
router.use('/groups', require('./groups'));
router.use('/users', require('./users'));
router.use('/category', require('./category'));

module.exports = router;
