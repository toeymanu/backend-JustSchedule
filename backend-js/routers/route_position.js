const express = require('express');
const router = express.Router();
const position_crtl =require('../controller/position_crtl');
const middleware_crtl = require('../controller/middleware_crtl')

router.get('/', position_crtl.selectPosition);
router.get('/generate', middleware_crtl.MiddleWare, position_crtl.selectPositionForGenerate);
router.get('/generate/condition', middleware_crtl.MiddleWare, position_crtl.selectAllConditionByDepartment);

router.post('/insert', position_crtl.insertPosition);
router.post('/update', position_crtl.updatePosition);
router.post('/generate/insert', position_crtl.insertPositionDayOff);
router.post('/generate/delete', position_crtl.deletePositionDayOff);

module.exports = router;