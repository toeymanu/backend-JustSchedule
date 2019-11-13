var mysql = require('mysql');
var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
const jwt = require("jwt-simple");
const bcrypt = require('bcryptjs');

exports.selectUserInSchedule = (req, res) => {
    let loginName = null;
    let allName = null;
    con.query(`select concat(name," ",surname) as Name, User_ID, p.Position_Name from User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and u.UserName = "${req.userName}"`,
        function (err, result, fields) {
            if (err) {
                console.log("/user : " + err)
                throw err
            };
            loginName = result[0]
        });
    con.query(`select concat(name," ",surname) as Name, User_ID,p.Position_Name from User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and u.userName != "${req.userName}"`,
        function (err, result2, fields) {
            if (err) {
                console.log("/user : " + err)
                throw err
            };
            allName = result2
            allName.splice(0, 0, loginName)

            res.json(allName)
        });
}

exports.selectNameForHeader = (req, res) => {
    con.query(`select name,surname from User where UserName = "${req.userName}"`,
        function (err, result, fields) {
            if (err) {
                console.log("/name : " + err)
                throw err
            };
            res.json(result)
        });
}

exports.selectManagerNotification = (req, res) => {
    con.query(`select u.User_ID,u.name,u.surname,u.Email,f.Request_ID, s.Schedule_ID, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = "${req.managerNotiID}" and rs.RequestStatus_Name = "pending" and r.RequestType_ID = 2 Order by  n.Notification_ID DESC, f.Request_ID ASC, f.RequestFor_ID ASC`,
        function (err, result, fields) {
            if (err) {
                console.log("/notification " + err)
                throw err;
            }
            res.json(result);
        })
}

exports.selectManagerAbsentNotification = (req, res) => {
    con.query(`select u.User_ID,u.name,u.surname,u.Email,f.Request_ID, s.Schedule_ID, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = "${req.managerNotiID}" and rs.RequestStatus_Name = "pending" and r.RequestType_ID = 1 Order by n.Notification_ID DESC`,
        function (err, result, fields) {
            if (err) {
                console.log("/notification " + err)
                throw err;
            }
            res.json(result);
        })
}

exports.selectStaffNotification = (req, res) => {
    con.query(`select u.User_ID,u.name,u.surname,n.Notification_Description, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = ${req.userNotiID} and rs.RequestStatus_Name != "pending" and u.User_ID = "${req.userNotiID}" Order by n.Notification_ID DESC`,
        function (err, result, fields) {
            if (err) {
                throw err;
            }
            res.json(result)
        })
}

exports.selectUserProfile = (req, res) => {
    con.query(`select User_ID,name,surname,Email,PhoneNumber,UserPicture,Password from User WHERE UserName = "${req.userName}"`,
        function (err, result, fields) {
            if (err) {
                throw err;
            }
            res.json(result)
        })
}

exports.updateUserProfile = (req, res) => {
    con.query(`UPDATE User SET name = "${req.body.name}", surname = "${req.body.surname}", Email = "${req.body.email}", PhoneNumber = "${req.body.telno}", UserPicture = "${req.body.picture}" WHERE UserName = "${req.userName}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json("Edit Profile Success")
    })
}

exports.loginNewUser = (req, res) => {
    const payload = {
        sub: req.body.username,
        iat: new Date().getTime(),
    };
    const SECRET = process.env.SECRETKEYS;
    res.json({ sc: jwt.encode(payload, SECRET) })
}

exports.loginOldUser = (req, res) => {
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

exports.register = (req, res) => {
    bcrypt.hash(req.body.register.password, 10, function (err, hashPassword) {
        con.query(`INSERT INTO User (UserName, Password) VALUES ("${req.body.register.username}","${hashPassword}")`, function (err, result, fields) {
            if (err) {
                console.log("/register : " + err)
                throw err
            };
            res.json(result);
        })
    })
}

exports.selectRequestByDepartment = (req, res) => {
    con.query(`select r.Request_ID,f.Schedule_ID From Request r JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN User u ON s.User_ID = u.User_ID JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID WHERE d.Department_ID = "${req.depID}" AND rs.RequestStatus_ID = 2`, function (err, result, fields) {
        if (err) {
            console.log("/already/request : " + err)
            throw err;
        }
        res.json(result)
    })
}

exports.insertAbsentInRequestFor = (req, res) => {
    let insert = `INSERT INTO RequestFor (RequestFor_Description, Request_ID, Schedule_ID) VALUES ?`
    let values = req.body.request.map(request => {
        return [req.body.description, req.reqID, request];
    });

    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/request : " + err)
            throw err;
        }
        res.json(req.reqID)
    })
}
exports.insertExchangeScheduleInRequestFor = (req, res) => {
    let insert = `INSERT INTO RequestFor (RequestFor_Description, Request_ID, Schedule_ID) VALUES ?`
    let values = req.body.request.map(request => {
        return ["Request For Change Schedule", req.reqID, request];
    });

    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/request : " + err)
            throw err;
        }
        res.json(req.reqID)
    })
}
exports.insertManagerAbsentNotification = (req, res) => {
    let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
    let values = [];

    values.push(["User Send Request Success", req.body.notification, req.managerID])
    con.query(insert, [values], function (err, result) {
        if (err) {
            console.log("/insert/notification/manager : " + err)
            throw err;
        }
        res.json("Request Success")
    })
}

exports.insertUserFromExcel = (req, res) => {
    let insert = 'INSERT INTO User (name,surname,Email,PhoneNumber,Username,Password,Position_ID) VALUES ?'
    let checkArr = []
    let arrLength = req.body.user.length

    var encryptPassword = new Promise((resolve, reject) => {
        req.body.user.forEach(async (value, index, array) => {
            await bcrypt.hash(value.password, 10, function (err, hashPassword) {
                checkArr.push(hashPassword);
                req.body.user[checkArr.length - 1].password = hashPassword
                if (arrLength === checkArr.length) resolve();
            })
        });
    });

    encryptPassword.then(() => {
        let values = req.body.user.map(user => {
            return [user.name, user.surname, user.email, user.telno, user.username, user.password, user.positionid];
        });
        con.query(insert, [values], function (err, result) {
            if (err) {
                console.log("/insert/user : " + err)
                throw err;
            }
            res.json(result)
        })
    });
}

exports.updateUserPosition = (req, res) => {
    con.query(`UPDATE User SET Position_ID = "${req.body.newposition}" WHERE User_ID = "${req.body.userid}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json({ status: 'success' })
    })
}

exports.getAllNotificationByDepartment = (req, res) => {
    con.query(`select u.User_ID,u.name,u.surname,f.Request_ID, s.Schedule_ID, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = "${req.body.manager[0].User_ID}" and rs.RequestStatus_Name = "pending" and r.RequestType_ID = 2 Order by  n.Notification_ID DESC, f.Request_ID ASC, f.RequestFor_ID ASC`,
        function (err, result, fields) {
            if (err) {
                console.log("/notification " + err)
                throw err;
            }
            res.json(result);
        })
}

exports.removeUser = (req, res) => {
    con.query(`UPDATE User SET Position_ID = null WHERE User_ID = "${req.body.user.User_ID}"`, function (err, result, fields) {
        if (err) {
            throw err;
        }
        res.json("remove success")
    })
}

exports.updateUserPassword = (req, res) => {
    bcrypt.hash(req.body.newpassword, 10, function (err, hashPassword) {
        con.query(`UPDATE User SET Password = "${hashPassword}" WHERE User_ID = "${req.body.userid}"`, function (err, result, fields) {
            if (err) {
                throw err;
            }
            res.json(result)
        })
    })
}