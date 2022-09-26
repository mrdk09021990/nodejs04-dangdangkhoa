var express = require('express');
var router = express.Router();

router.use('/', require('./home'));
router.use('/dashboard', require('./dashboard'));
router.use('/items', require('./items'));
router.use('/sliders', require('./sliders'));
router.use('/khoa', require('./khoa'));
router.use('/groups', require('./groups'));

module.exports = router;
