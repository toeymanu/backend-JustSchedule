var mysql = require('mysql');
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

exports.selectAllSchedule = (req, res) => {
    con.query(`select s.Schedule_ID,s.Period_ID,s.User_ID,s.Date,p.Period_ID,p.Period_Time_One,p.Period_Time_Two,p.Period_Color from Schedule s join Period p on s.Period_ID = p.Period_ID join User u ON s.User_ID = u.User_ID JOIN Position o ON u.Position_ID = o.Position_ID JOIN Department d ON o.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and s.Month = ${req.headers.month}`,
        function (err, result, fields) {
            if (err) {
                console.log("/schedule : " + err)
                throw err
            };
            res.json(result)
        });
}

exports.insertSchedule = (req, res) => {
    let insert = "INSERT INTO Schedule (User_ID, Date, Month, Period_ID) VALUES ?"
    let values = [];

    Object.keys(req.body.addperiodscheduletodb).forEach(e => {
        req.body.addperiodscheduletodb[e].forEach(event => {
            let key = e.split(',');
            values.push([key[0], key[1], req.body.month, event.Period_ID])
        })
    })

    con.query(insert, [values], function (err, result, fields) {
        if (err) {
            console.log("/schedule : " + err)
            res.end(result)
            throw err;
        }
        res.json(result);
    });
}

exports.deleteSchedule = (req, res) => {
    con.query(`Delete FROM Schedule where User_ID = "${req.body.DeletePeriodDB.User_ID}" and Date = "${req.body.DeletePeriodDB.Date}" and Period_ID = "${req.body.DeletePeriodDB.Period_ID}"`, function (err, result, fields) {
        if (err) {
            console.log("/deleteperiod : " + err)
            throw err
        };
        res.json(result)
    })
}

exports.selectNotificationForAutoReject = (req, res) => {
    con.query(`select u.User_ID,u.name,u.surname,f.Request_ID, s.Schedule_ID, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = "${req.managerNotiID}" and rs.RequestStatus_Name = "pending" Order by  n.Notification_ID DESC, f.Request_ID ASC, f.RequestFor_ID ASC`,
        function (err, result, fields) {
            if (err) {
                console.log("/notification " + err)
                throw err;
            }
            res.json(result);
        })
}
