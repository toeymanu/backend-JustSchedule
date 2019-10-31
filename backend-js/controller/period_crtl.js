var mysql = require('mysql');
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

exports.selectAllPeriodByDepartment = (req, res) => {
    con.query(`select * from Period p JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}"`, function (err, result, fields) {
        if (err) {
            console.log("/showperiod : " + err)
            throw err
        };
        res.json(result)
    })
}

exports.insertPeriodByDepartment = async (req, res) => {
    let insert = `INSERT INTO Period (Period_Name,Period_Time_One,Period_Time_Two,Period_Color, Department_ID) VALUES ?`
    let values = req.body.period.map(period => {
        return [period.periodName, period.periodOne, period.periodTwo, period.color, req.depID];
    });
    await con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/period : " + err)
            throw err;
        }
        res.json(result)
    })
}

exports.deletePeriodByDepartment = async (req, res) => {
    await con.query(`
  Delete from Schedule where Period_ID = "${req.body.DeletePeriod.Period_ID}"`, function (err, result, fields) {
        if (err) {
            console.log("/deleteperiod : " + err)
            throw err
        };
    })

    await con.query(`
  Delete from Period where Period_ID = "${req.body.DeletePeriod.Period_ID}"`, function (err, result, fields) {
        if (err) {
            console.log("/deleteperiod : " + err)
            throw err
        };
        res.json(result)
    })
}