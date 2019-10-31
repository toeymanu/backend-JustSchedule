const express = require('express');
const router = express.Router();
const company_crtl = require('../controller/company_crtl')
const middleware_crtl = require('../controller/middleware_crtl')


router.get('/', middleware_crtl.MiddleWare, company_crtl.selectCompanyInSchedule);
router.get('/admin', middleware_crtl.MiddleWare, company_crtl.selectCompany);

router.post('/update', company_crtl.updateCompanyDetail);
router.post('/update/picture', company_crtl.updateCompanyPicture);
router.post('/insert', middleware_crtl.nameMiddleware, middleware_crtl.createCompany, middleware_crtl.createAdminDepartment, middleware_crtl.createAdminPosition, middleware_crtl.updateUserPositionAdmin, company_crtl.loginAdmin);


module.exports = router;