const express = require('express');
const router = express.Router();
const user_crtl = require('../controller/user_crtl');
const middleware_crtl = require('../controller/middleware_crtl')
const email_crtl = require('../controller/email_crtl');


router.get('/', middleware_crtl.MiddleWare, user_crtl.selectUserInSchedule);
router.get('/name', middleware_crtl.nameMiddleware, user_crtl.selectNameForHeader);
router.get('/profile', middleware_crtl.nameMiddleware, user_crtl.selectUserProfile);

router.get('admin/notification', user_crtl.getAllNotificationByDepartment);

router.get('/manager/notification', middleware_crtl.MiddleWare, middleware_crtl.managerNotificationID, user_crtl.selectManagerNotification);
router.get('/manager/notification/absent', middleware_crtl.MiddleWare, middleware_crtl.managerNotificationID, user_crtl.selectManagerAbsentNotification);
router.get('/staff/notification', middleware_crtl.MiddleWare, middleware_crtl.userNotificationID, user_crtl.selectStaffNotification);
router.post('/manager/notification/insert', middleware_crtl.MiddleWare, middleware_crtl.getManagerIDForNotification, user_crtl.insertManagerAbsentNotification);
router.post('/manager/exchangenotification/approve', middleware_crtl.setExchangeUserEmail, email_crtl.sendExchangeEmail, middleware_crtl.managerApproveNotification, middleware_crtl.changeSchedule, middleware_crtl.insertApproveNotiStaff);
router.post('/manager/exchangenotification/reject', middleware_crtl.setExchangeUserEmail, email_crtl.sendExchangeEmail, middleware_crtl.rejectNotification, middleware_crtl.insertRejectNotiStaff);
router.post('/manager/absentnotification/approve', middleware_crtl.setAbsentUserEmail, email_crtl.sendAbsentEmail, middleware_crtl.managerApproveAbsentNoti, middleware_crtl.absentDeleteRequestFor, middleware_crtl.deleteSchedule, middleware_crtl.insertApproveAbsentNotiStaff);
router.post('/manager/absentnotification/reject', middleware_crtl.setAbsentUserEmail, email_crtl.sendAbsentEmail, middleware_crtl.managerRejectAbsentNotification, middleware_crtl.insertRejectAbsentNotiStaff);

router.post('/manager/exchangenotification/autoreject', email_crtl.sendExchangeAutoReject, middleware_crtl.rejectNotification, middleware_crtl.insertRejectNotiStaff);
router.post('/manager/absentnotification/autoreject', email_crtl.sendAbsentAutoReject, middleware_crtl.managerRejectAbsentNotification, middleware_crtl.insertRejectAbsentNotiStaff);

router.get('/request', middleware_crtl.MiddleWare, user_crtl.selectRequestByDepartment);
router.post('/request/exchangeschedule', middleware_crtl.insertExchangeScheduleRequest, middleware_crtl.getRequestID, user_crtl.insertExchangeScheduleInRequestFor);
router.post('/request/absent', middleware_crtl.insertAbsentRequest, middleware_crtl.getRequestID, user_crtl.insertAbsentInRequestFor);

router.post('/insert', user_crtl.insertUserFromExcel);
router.post('/register', middleware_crtl.regisMiddleware, user_crtl.register);

router.post('/remove', user_crtl.removeUser);

router.post('/login/authenticate', middleware_crtl.loginMiddleWare, user_crtl.loginNewUser);
router.post('/login/authenticated', middleware_crtl.checkMiddleWare, user_crtl.loginOldUser);

router.post('/profile/update', middleware_crtl.nameMiddleware, user_crtl.updateUserProfile);
router.post('/position/update', user_crtl.updateUserPosition);
router.post('/password/update', middleware_crtl.checkPasswordMiddleware, user_crtl.updateUserPassword);

module.exports = router;