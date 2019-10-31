const express = require('express');
const router = express.Router();
const schedule_crtl = require('../controller/schedule_crtl')
const middleware_crtl = require('../controller/middleware_crtl')

router.get('/', middleware_crtl.MiddleWare, schedule_crtl.selectAllSchedule);
router.get('/manager/notification', middleware_crtl.MiddleWare, middleware_crtl.managerNotificationID, schedule_crtl.selectNotificationForAutoReject);

router.post('/insert', schedule_crtl.insertSchedule);
router.post('/delete', schedule_crtl.deleteSchedule);
router.post('/delete/autoreject', middleware_crtl.rejectNotification, middleware_crtl.deleteRequestForInDB, middleware_crtl.autoDeleteSchedule);

module.exports = router;