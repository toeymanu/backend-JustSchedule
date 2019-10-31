const express = require('express');
const router = express.Router();
const position_crtl =require('../controller/position_crtl');
const middleware_crtl = require('../controller/middleware_crtl')

router.get('/', position_crtl.selectPosition);

router.post('/insert', position_crtl.insertPosition);
router.post('/update', position_crtl.updatePosition);

module.exports = router;