const express = require('express');
const router = express.Router();
const position_crtl =require('../controller/position_crtl');
const middleware_crtl = require('../controller/middleware_crtl')

router.get('/', position_crtl.selectPosition);
router.get('/generate', middleware_crtl.MiddleWare, position_crtl.selectPositionForGenerate);
router.get('/generate/condition', middleware_crtl.MiddleWare, position_crtl.selectAllConditionByDepartment);

router.post('/insert', position_crtl.insertPosition);
router.post('/update', position_crtl.updatePosition);
router.post('/generate/insert', middleware_crtl.insertPositionCondition, middleware_crtl.selectPositionConditionID,middleware_crtl.insertPositionDayOff);

module.exports = router;