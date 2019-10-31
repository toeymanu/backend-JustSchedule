var mysql = require('mysql');
const jwt = require("jwt-simple");
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

exports.selectCompanyInSchedule = (req, res) => {
    con.query(`select Company_Name from Company where Company_ID = "${req.compID}"`,
        function (err, result, fields) {
            if (err) {
                console.log("/company : " + err)
                throw err
            };
            res.json(result)
        });
}

exports.loginAdmin = (req, res) => {
    const payload = {
        sub: req.body.username,
        iat: new Date().getTime(),
        position: req.userPosition,
        posID: req.userPosID,
        depID: req.userDepartID,
        compID: req.userCompID
    };
    const SECRET = process.env.SECRETKEYS;
    res.json({ tk: jwt.encode(payload, SECRET) })
}

exports.selectCompany = (req, res) => {
    con.query(`SELECT * FROM Company WHERE Company_ID = "${req.compID}"`, function (err, result, fields) {
        if (err) {
            throw err
        }
        res.json(result)
    })
}

exports.updateCompanyDetail = (req, res) => {
    con.query(`UPDATE Company SET Company_Name = "${req.body.companyname}",Company_Mail="${req.body.companyemail}",Company_Tel = "${req.body.companytelno}" WHERE Company_ID = "${req.body.companyid}" `, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json({ status: 'success' })
    })
}

exports.updateCompanyPicture = (req, res) => {
    con.query(`UPDATE Company SET Company_Name = "${req.body.companyname}",Company_Mail="${req.body.companyemail}",Company_Tel = "${req.body.companytelno}",Company_Picture = "${req.body.companyimg}"  WHERE Company_ID = "${req.body.companyid}" `, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json({ status: 'success' })
    })
}