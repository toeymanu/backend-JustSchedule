var mysql = require('mysql');
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
var jwtDecode = require('jwt-decode');

exports.MiddleWare = (req, res, next) => {
    if (req.headers.tkauth != "null" || req.headers.tkauth != "undefined") {
        console.log(req.headers.tkauth)
        var decoded = jwtDecode(req.headers.tkauth);
        console.log(decoded)
        req.userName = decoded.sub;
        req.posID = decoded.posID;
        req.depID = decoded.depID;
        req.compID = decoded.compID;
        next();
    } else {
        res.status(404).send('Not Found');
    }
}

exports.nameMiddleware = (req, res, next) => {
    if (req.headers.tkauth != "null" || req.headers.tkauth != "undefined") {
        var decoded = jwtDecode(req.headers.tkauth);
        req.userName = decoded.sub;
        next();
    } else {
        res.status(404).send("Not Found");
    }
}

exports.managerNotificationID = (req, res, next) => {
    con.query(`select User_ID From User where UserName = "${req.userName}"`, function (err, result, fields) {
        req.managerNotiID = result[0].User_ID;
        next();
    })
}

exports.rejectNotification = async (req, res, next) => {
    let update = `UPDATE Request SET RequestStatus_ID = 3 WHERE Request_ID IN (?)`
    let values = req.body.reject.map(reject => {
        return [reject.Request_ID];
    });

    await con.query(update, [values], function (err, result) {
        if (err) {
            console.log("/request : " + err)
            throw err;
        }
    })
    next();
}

exports.deleteRequestForInDB = async (req, res, next) => {
    let deleted = `DELETE FROM RequestFor WHERE Schedule_ID IN (?)`
    let values = req.body.approve.map(approve => {
        return [approve.Schedule_ID];
    });

    await con.query(deleted, [values], function (err, result) {
        if (err) {
            console.log("/request : " + err)
            throw err;
        }
    })
    next();
}

exports.autoDeleteSchedule = async (req, res, next) => {
    let deleted = `DELETE FROM Schedule WHERE Schedule_ID IN (?)`
    let values = req.body.approve.map(approve => {
        return [approve.Schedule_ID];
    });

    await con.query(deleted, [values], function (err, result) {
        if (err) {
            console.log("/request : " + err)
            throw err;
        }
        res.json("Delete Success")
    })
}

exports.userNotificationID = (req, res, next) => {
    con.query(`select User_ID From User where UserName = "${req.userName}"`, function (err, result, fields) {
        req.userNotiID = result[0].User_ID;
        next();
    })
}

exports.loginMiddleWare = (req, res, next) => {
    con.query(`select UserName, Password from User where UserName = "${req.body.username}"`,
        function (err, result, fields) {
            if (err) {
                throw err;
            }
            if (result.length >= 1) {
                if (req.body.username === result[0].UserName && req.body.password == result[0].Password) {
                    next();
                } else {
                    res.json("Wrong Username or Password")
                }
            } else {
                res.json("Wrong Username or Password")
            }
        })
}

exports.checkMiddleWare = (req, res, next) => {
    con.query(`select name,surname,PhoneNumber,Email from User where UserName = "${req.body.username}"`,
        function (err, result, fields) {
            if (result[0].name != null) {
                con.query(`select p.Position_Name,p.Position_ID,d.Department_ID,p.Position_ID,c.Company_ID from User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID JOIN Company c ON d.Company_ID = c.Company_ID where u.UserName = "${req.body.username}"`,
                    function (err, results, fields) {
                        if (err) {
                            throw err;
                        }
                        if (results.length >= 1) {
                            req.userPosition = results[0].Position_Name
                            req.userPosID = results[0].Position_ID
                            req.userDepartID = results[0].Department_ID
                            req.userCompID = results[0].Company_ID
                            next();
                        } else {
                            res.json("Not have Position")
                        }
                    })
            } else {
                res.json("Not have Profile")
            }
        })
}

exports.regisMiddleware = (req, res, next) => {
    con.query(`select UserName from User where UserName = "${req.body.register.username}"`, function (err, result, fields) {
        if (result.length < 1) {
            next();
        } else {
            res.json("Username is already exists!!!");
        }
    })
}

exports.insertAbsentRequest = (req, res, next) => {
    let date = Date.now().toString();
    let insert = `INSERT INTO Request (Request_Date,RequestStatus_ID,RequestType_ID) VALUES ?`
    let values = [];

    values.push([date, 2, 1]);

    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("insertRequest : " + err)
            throw err;
        }
        req.date = date;
        next();
    })
}

exports.insertExchangeScheduleRequest = (req, res, next) => {
    let date = Date.now().toString();
    let insert = `INSERT INTO Request (Request_Date,RequestStatus_ID,RequestType_ID) VALUES ?`
    let values = [];

    values.push([date, 2, 2]);

    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("insertRequest : " + err)
            throw err;
        }
        req.date = date;
        next();
    })
}

exports.getRequestID = (req, res, next) => {
    con.query(`select Request_ID From Request WHERE Request_Date = "${req.date}"`, function (err, result, fields) {
        if (err) {
            console.log("getRequestID : " + err)
            throw err;
        }
        req.reqID = result[0].Request_ID
        next();
    })
}

exports.getManagerIDForNotification = (req, res, next) => {
    con.query(`select u.User_ID From User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and p.Position_Name = "Manager"`,
        function (err, result, fields) {
            if (err) {
                throw err;
            }
            req.managerID = result[0].User_ID
            next();
        })
}

exports.managerApproveNotification = (req, res, next) => {
    con.query(`UPDATE Request SET RequestStatus_ID = 1 WHERE Request_ID = ${req.body.approve[0].Request_ID}`, function (err, result) {
        if (err) {
            console.log("approveNotification : " + err)
            throw err;
        }
        next();
    })
}

exports.changeSchedule = (req, res, next) => {
    let values = req.body.approve.map(period => {
        return period.Period_ID;
    })
    let value = req.body.approve.map(scheduleID => {
        return scheduleID.Schedule_ID
    })

    let val = req.body.approve.map(day => {
        return day.Date
    })
    let arrayValue1 = value[0]
    let arrayValue2 = value[1]
    value = []
    value.push(arrayValue2, arrayValue1)

    con.query(`UPDATE Schedule SET Period_ID = "${values[0]}", Date = "${val[0]}" WHERE Schedule_ID = "${value[0]}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
    })
    con.query(`UPDATE Schedule SET Period_ID = "${values[1]}", Date = "${val[1]}" WHERE Schedule_ID = "${value[1]}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
    })
    next();
}

exports.insertApproveNotiStaff = (req, res) => {
    let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
    let values = req.body.approve.map(notification => {
        return ["Request is Approve", notification.Request_ID, notification.User_ID]
    })

    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/insert/notification/manager : " + err)
            throw err;
        }
        res.json("Approve Success");
    })
}

exports.insertRejectNotiStaff = (req, res) => {
    let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
    let values = req.body.reject.map(notification => {
        return ["Request is Reject", notification.Request_ID, notification.User_ID]
    })

    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/insert/notification/manager : " + err)
            throw err;
        }
        res.json("Reject Success");
    })
}

exports.managerApproveAbsentNoti = (req, res, next) => {
    con.query(`UPDATE Request SET RequestStatus_ID = 1 WHERE Request_ID = ${req.body.approve.Request_ID}`, function (err, result) {
        if (err) {
            console.log("approveNotification : " + err)
            throw err;
        }
        next();
    })
}

exports.absentDeleteRequestFor = (req, res, next) => {
    con.query(`DELETE From RequestFor Where Schedule_ID = "${req.body.approve.Schedule_ID}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        next();
    })
}

exports.deleteSchedule = (req, res, next) => {
    con.query(`DELETE From Schedule Where Schedule_ID = "${req.body.approve.Schedule_ID}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        next();
    })
}

exports.insertApproveAbsentNotiStaff = (req, res, next) => {
    let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
    let values = [["Request Absent is Approve", req.body.approve.Request_ID, req.body.approve.User_ID]]

    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/insert/notification/manager : " + err)
            throw err;
        }
        res.json("Approve Success")
    })
}

exports.managerRejectAbsentNotification = (req, res, next) => {
    con.query(`UPDATE Request SET RequestStatus_ID = 3 WHERE Request_ID = ${req.body.reject.Request_ID}`, function (err, result) {
        if (err) {
            console.log("approveNotification : " + err)
            throw err;
        }
        next();
    })
}

exports.insertRejectAbsentNotiStaff = async (req, res, next) => {
    let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
    let values = [["Request Absent is Reject", req.body.reject.Request_ID, req.body.reject.User_ID]]

    await con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/insert/notification/manager : " + err)
            throw err;
        }
        res.json("Reject Success");
    })
}

exports.createCompany = async (req, res, next) => {
    let insert = `INSERT INTO Company (Company_Name, Company_Mail,Company_Tel,Company_Picture) VALUES ?`
    let values = [[req.body.createcompany.companyName, req.body.createcompany.companyEmail, req.body.createcompany.companyTel, req.body.companypicture]]

    await con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/company/insert : " + err)
            throw err;
        }
    })

    await con.query(`Select Company_ID FROM Company WHERE Company_Name = "${req.body.createcompany.companyName}"`, function (err, result, fields) {
        if (err) {
            throw err
        }
        req.compID = result[0].Company_ID
        next();
    })
}

exports.createAdminDepartment = async (req, res, next) => {
    let insert = `INSERT INTO Department (Department_Name, Company_ID) VALUES ?`
    let values = [["Administrator", req.compID]]

    await con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/company/insert : " + err)
            throw err;
        }
    })

    await con.query(`select Department_ID from Department where Department_Name = "Administrator" and Company_ID = "${req.compID}"`, function (err, result, fields) {
        if (err) {
            console.log("/company/select : " + err)
            throw err
        };
        req.departID = result[0].Department_ID
        next();
    });
}

exports.createAdminPosition = async (req, res, next) => {
    let insert = 'INSERT INTO `Position` (Position_Name, Department_ID) VALUES ?'
    let values = [["Admin", req.departID]]

    await con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/company/insert : " + err)
            throw err;
        }
    })

    await con.query(`select Position_ID from Position where Department_ID = "${req.departID}" and Position_Name = "Admin"`, function (err, result, fields) {
        if (err) {
            console.log("/company/select : " + err)
            throw err
        };
        req.posID = result[0].Position_ID
        next();
    });
}

exports.updateUserPositionAdmin = async (req, res, next) => {
    await con.query(`UPDATE User SET Position_ID = "${req.posID}" WHERE UserName = "${req.userName}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
    })
    next();
}

exports.adminMiddleWare = async (req, res, next) => {
    con.query(`select name,surname,PhoneNumber,Email from User where UserName = "${req.userName}"`,
        function (err, result, fields) {
            if (result[0].name != null) {
                con.query(`select p.Position_Name,p.Position_ID,d.Department_ID,p.Position_ID,c.Company_ID from User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID JOIN Company c ON d.Company_ID = c.Company_ID where u.UserName = "${req.userName}"`,
                    function (err, results, fields) {
                        console.log(result)
                        if (err) {
                            throw err;
                        }
                        if (results.length >= 1) {
                            req.userPosition = results[0].Position_Name
                            req.userPosID = results[0].Position_ID
                            req.userDepartID = results[0].Department_ID
                            req.userCompID = results[0].Company_ID
                            next();
                        } else {
                            res.json("Not have Position")
                        }
                    })
            } else {
                res.json("Not have Profile")
            }
        })
}

exports.getDepartmentID = (req, res, next) => {
    con.query(`SELECT Department_ID FROM Department WHERE Department_Name = "${req.body.createdepartment.departmentName}" AND Company_ID = ${req.compID}`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        req.departID = result[0].Department_ID;
        next();
    })
}

exports.insertManagerPosition = (req, res) => {
    let insert = 'INSERT INTO `Position` (Position_Name,Department_ID) VALUES ?'
    let values = [["Manager", req.departID]];

    con.query(insert, [values], function (err, result) {
        if (err) {
            throw err;
        }
        res.json(result)
    })
}

// exports.removeUserInNotification = (req,res) => {
//     console.log(req.body)
//         con.query(`DELETE From Notification Where User_ID = "${}"`, function (err, result, fields) {
//           if (err) {
//             throw err;
//           }
//           next();
//         })
// }

// exports.getRequestIDForRemove = (req,res) => {

//     con.query(`DELETE From Notification Where User_ID = "${}"`, function (err, result, fields) {
//         if (err) {
//           throw err;
//         }
//         next();
//       })
// }

exports.insertPositionCondition = async (req,res,next) => {
    let insert = 'INSERT INTO PositionCondition (PeriodPerDay,PersonPerDay,Position_ID) VALUES ?'
    let values = [[req.body.periodPerDay,req.body.personPerDay,req.body.positionID[0]]]
    console.log(values)

    await con.query(insert, [values], function (err, result) {
        if (err) {
            throw err;
        }
        next()
    })
}

exports.selectPositionConditionID = (req,res,next) => {
    con.query(`SELECT PositionCondition_ID FROM PositionCondition WHERE Position_ID = "${req.body.positionID[0]}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        req.positionConID = result[0].PositionCondition_ID;
        next();
    })
}

exports.insertPositionDayOff = async (req,res) => {
    let insert = 'INSERT INTO PositionDayOff (PositionDayOff_Reason,Day,Month,PositionCondition_ID) VALUES ?'
    let values = req.body.holiday.map(day => {
        return [day.reason, day.date,req.body.month,req.positionConID]
    })

    await con.query(insert, [values], function (err, result) {
        if (err) {
            throw err;
        }
        res.json("insert success")
    })
}