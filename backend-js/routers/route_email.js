const express = require('express');
const router = express.Router();
const email_ctrl = require('../controller/email_crtl')

router.post('/send', email_ctrl.sendEmail);

module.exports = router;