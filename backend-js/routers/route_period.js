const express = require('express');
const router = express.Router();
const period_crtl = require('../controller/period_crtl')
const middleware_crtl = require('../controller/middleware_crtl')

router.get('/', middleware_crtl.MiddleWare, period_crtl.selectAllPeriodByDepartment);

router.post('/insert', middleware_crtl.MiddleWare, period_crtl.insertPeriodByDepartment);
router.post('/delete', period_crtl.deletePeriodByDepartment);
router.post('/delete/autoreject', middleware_crtl.rejectNotification, middleware_crtl.deleteRequestForInDB, period_crtl.deletePeriodByDepartment);
module.exports = router;