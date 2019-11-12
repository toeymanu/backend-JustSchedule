var mysql = require('mysql');
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});


exports.selectDepartmentInSchedule = (req, res) => {
    con.query(`select Department_Name from Department where Department_ID = "${req.depID}"`,
        function (err, result, fields) {
            if (err) {
                console.log("/department : " + err)
                throw err
            };
            res.json(result)
        });
}

exports.selectDepartment = (req, res) => {
    con.query(`SELECT * FROM Department WHERE Company_ID = "${req.compID}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json(result)
    })
}

exports.updateDepartment = (req, res) => {
    con.query(`UPDATE Department SET Department_Name = "${req.body.departname}",Department_TelNo = "${req.body.departtelno}",Department_Picture = "${req.body.departimg}"  WHERE Department_ID = "${req.body.departid}" `, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json({ status: 'success' })
    })
}

exports.insertDepartment = (req, res, next) => {
    let insert = `INSERT INTO Department (Department_Name,Department_Picture,Department_TelNo,Company_ID) VALUES ?`
    let values = [[req.body.createdepartment.departmentName, req.body.departmentpicture, req.body.createdepartment.departmentTel, req.compID]]

    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/company/insert : " + err)
            throw err;
        }
        next();
    })
}

exports.selectUserInDepartment = (req, res) => {
    con.query(`SELECT u.User_ID,u.name,u.surname,u.Email,u.PhoneNumber,u.UserPicture,p.Position_Name FROM User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID WHERE d.Department_ID = "${req.headers.departid}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json(result);
    })
}

