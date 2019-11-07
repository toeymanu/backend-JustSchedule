let nodemailer  = require('nodemailer');
exports.sendEmail = (req, res) => {
    let to = req.body.email
    let subject = req.body.subject
    let username = req.body.username
    let password = req.body.password

    const tranporter = nodemailer.createTransport({
        service: 'gmail',
        secureConnection: true,
        auth: {
            user: process.env.EMAIL_MAIL,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            secureProtocol: process.env.EMAIL_PROTOCOL
        }
    })

    let mailOption = {
        from: '"ทีมงาน JS+" <justscheduleplus@gmail.com>',
        to: to,
        subject: subject,
        html: `<h3>From: ทีมงาน JS+<h3>` + "\n" +
            `<h3>To:${to}<h3>` + "\n" +
            `<span>This is your account</span>` + "\n" +
            `<span>Username: ${username}</span>` + "\n" +
            `<span>Password: ${password}</span>` + "\n" +
            `<span>Thanks for trust our website</span>` + "\n"

    };

    tranporter.sendMail(mailOption, function (err, info) {
        if (err)
            console.log(err)
        else
            res.json(info.res)
    })
}