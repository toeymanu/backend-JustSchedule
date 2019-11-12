let nodemailer = require('nodemailer');
let picture = "https://firebasestorage.googleapis.com/v0/b/justschedulsplus.appspot.com/o/userImages%2Flogo.png?alt=media&token=49ed4584-1a58-4d1b-8b23-0ebf211f57fa&fbclid=IwAR2VIEIYxq3ACKpLhmDgMLpzPMb6lbl5DO5Mgv-TtQsAnjjSUbPA1k-VbyY"

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

exports.sendAbsentEmail = async (req, res, next) => {
    let email = req.email
    let subject = req.resultAbsent
    let name = req.name
    let date = req.date
    let month = req.month
    let period = req.period

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
        to: email,
        subject: subject,
        html: `<h3>From: ทีมงาน JS+<h3>` + '\n' +
            `<span>To : ${name}<span><br/>` + '\n' +
            `<span>${subject}</span><br/>` + "\n" +
            `<span>Date : ${date} / ${month} / 2019</span><br/>` + '\n' +
            `<span>Time : ${period}</span><br/>` + '\n' +
            `<h4>Thanks for trust our website</h4><br/>` + '\n' +
            `<img style={{marginLeft:"auto", marginRight: "auto"}} src = ${picture} />`
    };

    await tranporter.sendMail(mailOption, function (err, info) {
        if (err)
            console.log(err)
        // else
        next();
    })
}

exports.sendExchangeEmail = async (req, res, next) => {
    if (req.approve) {
        let email = req.email
        let resultExchange = req.resultExchange
        let name = req.name
        let date = req.date
        let month = req.month
        let period = req.period

        let emailReq = req.emailReq
        let resultExchangeReq = req.resultExchangeReq
        let nameReq = req.nameReq
        let dateReq = req.dateReq
        let monthReq = req.monthReq
        let periodReq = req.periodReq

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
            to: email,
            subject: resultExchange,
            html: `<h3>From: ทีมงาน JS+<h3>` + '\n' +
                `<span>To : ${name}<span><br/>` + '\n' +
                `<span>${resultExchange}</span><br/>` + "\n" +
                `<span>From : ${date} / ${month} / 2019 Time : ${period}</span><br/>` + '\n' +
                `<span>To : ${dateReq} / ${monthReq} / 2019 Time : ${periodReq}</span><br/>` + '\n' +
                `<h4>Thanks for trust our website</h4><br/>` + '\n' +
                `<img style={{marginLeft:"auto", marginRight: "auto"}} src = ${picture} />`
        };

        let mailOption2 = {
            from: '"ทีมงาน JS+" <justscheduleplus@gmail.com>',
            to: emailReq,
            subject: resultExchangeReq,
            html: `<h3>From: ทีมงาน JS+<h3>` + '\n' +
                `<span>To : ${nameReq}<span><br/>` + '\n' +
                `<span>${resultExchangeReq}</span><br/>` + "\n" +
                `<span>From : ${dateReq} / ${monthReq} / 2019 Time : ${periodReq}</span><br/>` + '\n' +
                `<span>To : ${date} / ${month} / 2019 Time : ${period}</span><br/>` + '\n' +
                `<h4>Thanks for trust our website</h4><br/>` + '\n' +
                `<img style={{marginLeft:"auto", marginRight: "auto"}} src = ${picture} />`
        };

        await tranporter.sendMail(mailOption, function (err, info) {
            if (err)
                console.log(err)
        })

        await tranporter.sendMail(mailOption2, function (err, info) {
            if (err)
                console.log(err)
            else
                next();
        })
    } else {
        let email = req.email
        let resultAbsent = req.resultAbsent
        let name = req.name
        let date = req.date
        let month = req.month
        let period = req.period

        let nameReq = req.nameReq
        let dateReq = req.dateReq
        let monthReq = req.monthReq
        let periodReq = req.periodReq

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
            to: email,
            subject: resultAbsent,
            html: `<h3>From: ทีมงาน JS+<h3>` + '\n' +
                `<span>To : ${name}<span><br/>` + '\n' +
                `<span>${resultAbsent}</span><br/>` + "\n" +
                `<span>From : ${date} / ${month} / 2019 Time : ${period}</span><br/>` + '\n' +
                `<span>${nameReq}<span><br/>` + '\n' +
                `<span>To : ${dateReq} / ${monthReq} / 2019 Time : ${periodReq}</span><br/>` + '\n' +
                `<h4>Thanks for trust our website</h4><br/>` + '\n' +
                `<img style={{marginLeft:"auto", marginRight: "auto"}} src = ${picture} />`
        };

        await tranporter.sendMail(mailOption, function (err, info) {
            if (err) console.log(err)
            next();
        })
    }
}

exports.sendExchangeAutoReject = async (req, res, next) => {

    let subject = "Your Exchange Request has been auto reject."
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

    await req.body.reject.forEach(function (to, i, array) {
        var msg = {
            from: '"ทีมงาน JS+" <justscheduleplus@gmail.com>',
            subject: subject,
            html: `<h3>From: ทีมงาน JS+<h3>` + '\n' +
                `<span>To : ${to.name} ${to.surname}<span><br/>` + '\n' +
                `<span>${subject}</span><br/>` + "\n" +
                `<span>From : ${to.Date} / ${to.Month} / 2019 Time : ${to.Period_Time_One} - ${to.Period_Time_Two}</span><br/>` + '\n' +
                `<h4>Thanks for trust our website</h4><br/>` + '\n' +
                `<img style={{marginLeft:"auto", marginRight: "auto"}} src = ${picture} />`
        }
        msg.to = to.Email;

        tranporter.sendMail(msg, function (err) {
            if (err) console.log(err)
        })
    })
    next();
}

exports.sendAbsentAutoReject = async (req, res, next) => {
    let subject = "Your Absent Request has been auto reject."
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

    await req.body.reject.forEach(function (to, i, array) {
        var msg = {
            from: '"ทีมงาน JS+" <justscheduleplus@gmail.com>',
            subject: subject,
            html: `<h3>From: ทีมงาน JS+<h3>` + '\n' +
                `<span>To : ${to.name} ${to.surname}<span><br/>` + '\n' +
                `<span>${subject}</span><br/>` + "\n" +
                `<span>From : ${to.Date} / ${to.Month} / 2019 Time : ${to.Period_Time_One} - ${to.Period_Time_Two}</span><br/>` + '\n' +
                `<h4>Thanks for trust our website</h4><br/>` + '\n' +
                `<img style={{marginLeft:"auto", marginRight: "auto"}} src = ${picture} />`
        }
        msg.to = to.Email;

        tranporter.sendMail(msg, function (err) {
            if (err) console.log(err)
        })
    })
    next();
}