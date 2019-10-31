const express = require('express');
const router = express.Router();
const department_crtl = require('../controller/department_crtl')
const middleware_crtl = require('../controller/middleware_crtl')


router.get('/', middleware_crtl.MiddleWare, department_crtl.selectDepartmentInSchedule);
router.get('/admin', middleware_crtl.MiddleWare, department_crtl.selectDepartment);
router.get('/user', department_crtl.selectUserInDepartment);

router.post('/insert', middleware_crtl.MiddleWare, department_crtl.insertDepartment, middleware_crtl.getDepartmentID, middleware_crtl.insertManagerPosition);
router.post('/update', department_crtl.updateDepartment);

module.exports = router;