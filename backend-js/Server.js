const express = require('express')
var cors = require('cors')
const app = express()
app.use(cors())
var mysql = require('mysql');
require('dotenv').config();
var bodyParser = require('body-parser')
const jwt = require("jwt-simple");
var jwtDecode = require('jwt-decode');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


/*------------------------------Token------------------------------------*/
function MiddleWare(req, res, next) {
  if (req.headers.tkauth != "null" || req.headers.tkauth != "undefined") {
    var decoded = jwtDecode(req.headers.tkauth);
    req.userName = decoded.sub;
    req.posID = decoded.posID;
    req.depID = decoded.depID;
    req.compID = decoded.compID;
    next();
  } else {
    res.status(404).send('Not Found');
  }
}

function nameMiddleware(req, res, next) {
  if (req.headers.tkauth != "null" || req.headers.tkauth != "undefined") {
    var decoded = jwtDecode(req.headers.tkauth);
    req.userName = decoded.sub;
    next();
  } else {
    res.status(404).send("Not Found");
  }
}

function managerNotificationID(req, res, next) {
  con.query(`select User_ID From User where UserName = "${req.userName}"`, function (err, result, fields) {
    req.managerNotiID = result[0].User_ID;
    next();
  })
}

function getManagerNotiID(req, res, next) {
  con.query(`select * From User where UserName = "${req.userName}"`,
    function (err, result, fields) {
      if (err) {
        throw err
      }
      req.managerNotiID = result[0].User_ID;
      next();
    })
}

function userNotificationID(req, res, next) {
  con.query(`select User_ID From User where UserName = "${req.userName}"`, function (err, result, fields) {
    req.userNotiID = result[0].User_ID;
    next();
  })
}

/*------------------------------Const Company------------------------------------*/
const createCompany = async (req, res, next) => {
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

const createAdminDepartment = async (req, res, next) => {
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

const createAdminPosition = async (req, res, next) => {
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

const updateUserAdmin = async (req, res, next) => {
  await con.query(`UPDATE User SET Position_ID = "${req.posID}" WHERE UserName = "${req.userName}"`, function (err, result, fields) {
    if (err) {
      throw err;
    }
  })
  next();
}

/*------------------------------Const Admin------------------------------------*/
const adminMiddleWare = async (req, res, next) => {
  con.query(`select name,surname,PhoneNumber,Email from User where UserName = "${req.userName}"`,
    function (err, result, fields) {
      if (result[0].name != null) {
        con.query(`select p.Position_Name,p.Position_ID,d.Department_ID,p.Position_ID,c.Company_ID from User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID JOIN Company c ON d.Company_ID = c.Company_ID where u.UserName = "${req.userName}"`,
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
};

const LoginMiddleWare = (req, res, next) => {
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

const CheckMiddleWare = (req, res, next) => {
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
};

/*------------------------------Const Notification------------------------------------*/
const getManagerIDForNotification = (req, res, next) => {
  con.query(`select u.User_ID From User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and p.Position_Name = "Manager"`,
    function (err, result, fields) {
      if (err) {
        throw err;
      }
      req.managerID = result[0].User_ID
      next();
    })
}

const approveNotification = (req, res, next) => {
  con.query(`UPDATE Request SET RequestStatus_ID = 1 WHERE Request_ID = ${req.body.approve[0].Request_ID}`, function (err, result) {
    if (err) {
      console.log("approveNotification : " + err)
      throw err;
    }
    next();
  })
};

const rejectNotification = async (req, res, next) => {
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

const approveAbesntNotification = async (req, res, next) => {
  await con.query(`UPDATE Request SET RequestStatus_ID = 1 WHERE Request_ID = ${req.body.approve.Request_ID}`, function (err, result) {
    if (err) {
      console.log("approveNotification : " + err)
      throw err;
    }
    next();
  })
};

const rejectAbsentNotification = (req, res, next) => {
  con.query(`UPDATE Request SET RequestStatus_ID = 3 WHERE Request_ID = ${req.body.reject.Request_ID}`, function (err, result) {
    if (err) {
      console.log("approveNotification : " + err)
      throw err;
    }
    next();
  })
}

const changeSchedule = (req, res, next) => {
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
const deleteRequestFor = (req, res, next) => {
  con.query(`DELETE From RequestFor Where Schedule_ID = "${req.body.approve.Schedule_ID}"`, function (err, result, fields) {
    if (err) {
      throw err;
    }
    next();
  })
}

const deleteScedule = (req, res, next) => {
  con.query(`DELETE From Schedule Where Schedule_ID = "${req.body.approve.Schedule_ID}"`, function (err, result, fields) {
    if (err) {
      throw err;
    }
    next();
  })
}

const autoDeleteRequestFor = async (req, res, next) => {
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

const autoDeleteScedule = async (req, res, next) => {
  let deleted = `DELETE FROM Schedule WHERE Schedule_ID IN (?)`
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

const sendApproveNotificationToUser = (req, res, next) => {
  let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
  let values = req.body.approve.map(notification => {
    return ["Request is Approve", notification.Request_ID, notification.User_ID]
  })

  con.query(insert, [values], function (err, result) {
    if (err) {
      console.log("/insert/notification/manager : " + err)
      throw err;
    }
    next();
  })
}

const sendRejectNotificationToUser = (req, res, next) => {
  let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
  let values = req.body.reject.map(notification => {
    return ["Request is Reject", notification.Request_ID, notification.User_ID]
  })

  con.query(insert, [values], function (err, result) {
    if (err) {
      console.log("/insert/notification/manager : " + err)
      throw err;
    }
    next();
  })
}

const sendApproveAbsentNotificationToUser = (req, res, next) => {
  let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
  let values = [["Request Absent is Approve", req.body.approve.Request_ID, req.body.approve.User_ID]]

  con.query(insert, [values], function (err, result) {
    if (err) {
      console.log("/insert/notification/manager : " + err)
      throw err;
    }
    next();
  })
}

const sendRejectAbsentNotificationToUser = async (req, res, next) => {
  let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
  let values = [["Request Absent is Reject", req.body.reject.Request_ID, req.body.reject.User_ID]]

  await con.query(insert, [values], function (err, result) {
    if (err) {
      console.log("/insert/notification/manager : " + err)
      throw err;
    }
    next();
  })
}

/*------------------------------Const Request------------------------------------*/
const insertRequest = (req, res, next) => {
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

const insertRequestAbsent = (req, res, next) => {
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

const getRequestID = (req, res, next) => {
  con.query(`select Request_ID From Request WHERE Request_Date = "${req.date}"`, function (err, result, fields) {
    if (err) {
      console.log("getRequestID : " + err)
      throw err;
    }
    req.reqID = result[0].Request_ID
    next();
  })
}

/*------------------------------Const Register------------------------------------*/
const regisMiddleware = (req, res, next) => {
  con.query(`select UserName from User where UserName = "${req.body.register.username}"`, function (err, result, fields) {
    if (result.length < 1) {
      next();
    } else {
      res.json("Username is already exists!!!");
    }
  })
}

/*------------------------------Select------------------------------------*/
app.get('/users', MiddleWare, (req, res) => {
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
})

app.get('/company', MiddleWare, (req, res) => {
  con.query(`select Company_Name from Company where Company_ID = "${req.compID}"`,
    function (err, result, fields) {
      if (err) {
        console.log("/company : " + err)
        throw err
      };
      res.json(result)
    });
})

app.get('/department', MiddleWare, (req, res) => {
  con.query(`select Department_Name from Department where Department_ID = "${req.depID}"`,
    function (err, result, fields) {
      if (err) {
        console.log("/department : " + err)
        throw err
      };
      res.json(result)
    });
})

app.get('/showperiod', MiddleWare, (req, res) => {
  con.query(`select * from Period p JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}"`, function (err, result, fields) {
    if (err) {
      console.log("/showperiod : " + err)
      throw err
    };
    res.json(result)
  })
})

app.get('/name', nameMiddleware, (req, res) => {
  con.query(`select name,surname from User where UserName = "${req.userName}"`,
    function (err, result, fields) {
      if (err) {
        console.log("/name : " + err)
        throw err
      };
      res.json(result)
    });
})

app.get("/manager/notification", MiddleWare, managerNotificationID, (req, res) => {
  con.query(`select u.User_ID,u.name,u.surname,f.Request_ID, s.Schedule_ID, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = "${req.managerNotiID}" and rs.RequestStatus_Name = "pending" and r.RequestType_ID = 2 Order by  n.Notification_ID DESC, f.Request_ID ASC, f.RequestFor_ID ASC`,
    function (err, result, fields) {
      if (err) {
        console.log("/notification " + err)
        throw err;
      }
      res.json(result);
    })
})

app.get("/manager/notification/absent", MiddleWare, getManagerNotiID, (req, res) => {
  con.query(`select u.User_ID,u.name,u.surname,f.Request_ID, s.Schedule_ID, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = "${req.managerNotiID}" and rs.RequestStatus_Name = "pending" and r.RequestType_ID = 1 Order by n.Notification_ID DESC`,
    function (err, result, fields) {
      if (err) {
        console.log("/notification " + err)
        throw err;
      }
      res.json(result);
    })
})

app.get("/manager/notification/schedule", MiddleWare, managerNotificationID, (req, res) => {
  con.query(`select u.User_ID,u.name,u.surname,f.Request_ID, s.Schedule_ID, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = "${req.managerNotiID}" and rs.RequestStatus_Name = "pending" Order by  n.Notification_ID DESC, f.Request_ID ASC, f.RequestFor_ID ASC`,
    function (err, result, fields) {
      if (err) {
        console.log("/notification " + err)
        throw err;
      }
      res.json(result);
    })
})

app.get("/user/notification", MiddleWare, userNotificationID, (req, res) => {
  con.query(`select u.User_ID,u.name,u.surname,n.Notification_Description, s.Period_ID, s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = ${req.userNotiID} and rs.RequestStatus_Name != "pending" and u.User_ID = "${req.userNotiID}" Order by n.Notification_ID DESC`,
    function (err, result, fields) {
      if (err) {
        throw err;
      }
      res.json(result)
    })
})
/*------------------------------Schedule------------------------------------*/
app.post('/schedule', (req, res) => {
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
})

app.post('/schedule/delete', (req, res) => {
  con.query(`Delete FROM Schedule where User_ID = "${req.body.DeletePeriodDB.User_ID}" and Date = "${req.body.DeletePeriodDB.Date}" and Period_ID = "${req.body.DeletePeriodDB.Period_ID}"`, function (err, result, fields) {
    if (err) {
      console.log("/deleteperiod : " + err)
      throw err
    };
    res.json(result)
  })
})

app.post('/schedule/deleted', rejectNotification, autoDeleteRequestFor, autoDeleteScedule, (req, res) => {
  res.json("Delete Success")
})

app.get('/showschedule', MiddleWare, (req, res) => {
  con.query(`select s.Schedule_ID,s.Period_ID,s.User_ID,s.Date,p.Period_ID,p.Period_Time_One,p.Period_Time_Two,p.Period_Color from Schedule s join Period p on s.Period_ID = p.Period_ID join User u ON s.User_ID = u.User_ID JOIN Position o ON u.Position_ID = o.Position_ID JOIN Department d ON o.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and s.Month = ${req.headers.month}`,
    function (err, result, fields) {
      if (err) {
        console.log("/showschedule : " + err)
        throw err
      };
      res.json(result)
    });
})

app.get('/already/request', MiddleWare, (req, res) => {
  con.query(`select r.Request_ID,f.Schedule_ID From Request r JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN User u ON s.User_ID = u.User_ID JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID WHERE d.Department_ID = "${req.depID}" AND rs.RequestStatus_ID = 2`, function (err, result, fields) {
    if (err) {
      console.log("/already/request : " + err)
      throw err;
    }
    res.json(result)
  })
})

/*------------------------------Period------------------------------------*/
app.post('/period', MiddleWare, async (req, res) => {

  let insert = `INSERT INTO Period (Period_Name,Period_Time_One,Period_Time_Two,Period_Color, Department_ID) VALUES ?`
  let values = req.body.period.map(period => {
    return [period.periodName, period.periodOne, period.periodTwo, period.color, req.depID];
  });
  con.query(insert, [values], function (err, result) {
    if (err) {
      console.log("/period : " + err)
      throw err;
    }
    res.json(result)
  })
})

app.post('/deleteperiod', async (req, res) => {
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
})

app.post('/delete/period', rejectNotification, autoDeleteRequestFor, async (req, res) => {
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
})

/*------------------------------Register------------------------------------*/
app.post('/register', regisMiddleware, (req, res) => {
  con.query(`INSERT INTO User (UserName, Password) VALUES ("${req.body.register.username}","${req.body.register.password}")`, function (err, result, fields) {
    if (err) {
      console.log("/register : " + err)
      throw err
    };
    res.json(result);
  })
})

/*------------------------------Request------------------------------------*/
app.post("/request", insertRequest, getRequestID, (req, res) => {
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
});

app.post("/request/absent", insertRequestAbsent, getRequestID, (req, res) => {
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
});

/*------------------------------Notification------------------------------------*/
app.post("/insert/notification/manager", MiddleWare, getManagerIDForNotification, (req, res) => {
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
});

app.post('/notification/approve', approveNotification, changeSchedule, sendApproveNotificationToUser, (req, res) => {
  res.json("Approve Success");
})

app.post('/notification/reject', rejectNotification, sendRejectNotificationToUser, (req, res) => {
  res.json("Reject Success");
})

app.post('/notification/absent/approve', approveAbesntNotification, deleteRequestFor, deleteScedule, sendApproveAbsentNotificationToUser, (req, res) => {
  res.json("Approve Success")
})

app.post('/notification/absent/reject', rejectAbsentNotification, sendRejectAbsentNotificationToUser, (req, res) => {
  res.json("Reject Success");
})

/*------------------------------Edit Profile------------------------------------*/
app.get('/user/profile', nameMiddleware, (req, res) => {
  con.query(`select name,surname,Email,PhoneNumber,UserPicture from User WHERE UserName = "${req.userName}"`,
    function (err, result, fields) {
      if (err) {
        throw err;
      }
      res.json(result)
    })
})

app.post('/insert/user/profile', nameMiddleware, (req, res) => {
  con.query(`UPDATE User SET name = "${req.body.name}", surname = "${req.body.surname}", Email = "${req.body.email}", PhoneNumber = "${req.body.telno}", UserPicture = "${req.body.picture}" WHERE UserName = "${req.userName}"`, function (err, result, fields) {
    if (err) {
      throw err;
    }
    res.json("Edit Profile Success")
  })
})

/*------------------------------Login------------------------------------*/
app.post("/users/authenticate", LoginMiddleWare, (req, res) => {
  const payload = {
    sub: req.body.username,
    iat: new Date().getTime(),
  };
  const SECRET = process.env.SECRETKEYS;
  res.json({ sc: jwt.encode(payload, SECRET) })
});

app.post("/users/requesttk", CheckMiddleWare, (req, res) => {
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
});

/*------------------------------Create Company------------------------------------*/
app.post('/company/insert', nameMiddleware, createCompany, createAdminDepartment, createAdminPosition, updateUserAdmin, adminMiddleWare, (req, res) => {
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
})

app.post('/department/insert', MiddleWare, (req, res) => {
  let insert = `INSERT INTO Department (Department_Name,Department_Picture,Department_TelNo,Company_ID) VALUES ?`
  let values = [[req.body.department.departmentName, req.body.departmentImg, req.body.department.departmentTel, req.compID]]

  con.query(insert, [values], function (err, result) {
    if (err) {
      console.log("/company/insert : " + err)
      throw err;
    }
    res.json(result)
  })
})

app.get('/get/company', MiddleWare, (req, res) => {
  con.query(`SELECT * FROM Company WHERE Company_ID = "${req.compID}"`, function (err, result, fields) {
    if (err) {
      throw err
    }
    res.json(result)
  })
})

app.get('/get/department', MiddleWare, (req, res) => {
  con.query(`SELECT * FROM Department WHERE Company_ID = "${req.compID}"`, function (err, result, fields) {
    if (err) {
      throw err;
    }
    res.json(result)
  })
})

app.get('/get/department/user', (req, res) => {
  con.query(`SELECT u.User_ID,u.name,u.surname,u.Email,u.PhoneNumber,u.UserPicture,p.Position_Name FROM User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID WHERE d.Department_ID = "${req.headers.departid}"`, function (err, result, fields) {
    if (err) {
      throw err;
    }
    res.json(result);
  })
})

/*------------------------------Connect DB------------------------------------*/
con.connect(err => {
  app.listen(8080, () => {
    console.log('Connection success, Start server at port 8080.')
  })
})