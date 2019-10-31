var mysql = require('mysql');
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

exports.selectPosition = (req, res) => {
    con.query(`SELECT Position_ID,Position_Name FROM Position WHERE Department_ID = "${req.headers.departid}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json(result);
    })
}

exports.insertPosition = (req, res) => {
    let insert = 'INSERT INTO `Position` (Position_Name,Department_ID) VALUES ?'
    let values = req.body.position.map(position => {
        return [position, req.body.departid];
    });

    con.query(insert, [values], function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result)
    })
}

exports.updatePosition = (req, res) => {
    con.query(`UPDATE \`Position\` SET Position_Name = "${req.body.position}" WHERE Position_ID = "${req.body.departid}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json({ status: 'success' })
    })
}