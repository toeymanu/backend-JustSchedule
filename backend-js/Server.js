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
  if (req.headers.tkauth != "null" || req.headers.tkauth != "undefined") {
    var decoded = jwtDecode(req.headers.tkauth);
    con.query(`select User_ID From User where UserName = "${decoded.sub}"`, function (err, result, fields) {
      req.managerNotiID = result[0].User_ID;
      next();
    })
  }
}

/*------------------------------Select------------------------------------*/

app.get('/users', MiddleWare, (req, res) => {
  let loginName = null;
  let allName = null;
  con.query(`select concat(name," ",surname) as Name, User_ID from User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and u.UserName = "${req.userName}"`,
    function (err, result, fields) {
      if (err) {
        console.log("/user : " + err)
        throw err
      };
      loginName = result[0]
    });
  con.query(`select concat(name," ",surname) as Name, User_ID from User u JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and u.userName != "${req.userName}"`,
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

app.get("/notification", managerNotificationID, (req, res) => {
  con.query(`select concat(u.name," ",u.surname), s.Date, s.Month, p.Period_Time_One, p.Period_Time_Two From Notification n JOIN Request r ON n.Request_ID = r.Request_ID JOIN RequestStatus rs ON r.RequestStatus_ID = rs.RequestStatus_ID JOIN RequestFor f ON r.Request_ID = f.Request_ID JOIN Schedule s ON f.Schedule_ID = s.Schedule_ID JOIN Period p ON s.Period_ID = p.Period_ID JOIN User u ON s.User_ID = u.User_ID WHERE n.User_ID = "${req.managerNotiID}" and rs.RequestStatus_Name = "pending"`,
    function (err, result, fields) {
      if (err) {
        console.log("/notification " + err)
        throw err;
      }
      res.json(result);
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

/*------------------------------Register------------------------------------*/
const regisMiddleware = (req, res, next) => {
  con.query(`select UserName from User where UserName = "${req.body.register.username}"`, function (err, result, fields) {
    if (result.length < 1) {
      next();
    } else {
      res.json("Username is already exists!!!");
    }
  })
}

app.post('/register', regisMiddleware, (req, res) => {
  con.query(`INSERT INTO User (UserName, Password) VALUES ("${req.body.register.username}","${req.body.register.password}")`, function (err, result, fields) {
    if (err) {
      console.log("/register : " + err)
      throw err
    };
    res.json(result);
  })
})

/*------------------------------Company------------------------------------*/
app.get('/company/select', (req, res) => {
  con.query('select * from Company c where c.Company_ID = 11 ', function (err, result, fields) {
    if (err) {
      console.log("/company/select" + err)
      throw err
    };
    res.json(result)
  });
})

app.post('/company/insert', (req, res) => {
  con.query(`INSERT INTO Company (Company_Name, Company_Mail,Company_Tel,Company_Picture) VALUES ("${req.body.createcompany.companyName}","${req.body.createcompany.companyEmail}","${req.body.createcompany.companyTel}","${req.body.companypicture}")`, function (err, result, fields) {
    if (err) {
      console.log("/company/insert : " + err)
      throw err
    };
    res.json(result);
  })
})

/*------------------------------Request------------------------------------*/
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


app.post("/request", insertRequest, getRequestID, (req, res) => {
  let insert = `INSERT INTO RequestFor (RequestFor_Description, Request_ID, Schedule_ID) VALUES ?`
  let values = req.body.request.map(request => {
    return ["TEST", req.reqID, request];
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
const getManagerIDForNotification = (req, res, next) => {
  con.query(`select u.User_ID From Request q JOIN RequestFor r ON q.Request_ID = r.Request_ID JOIN Schedule s ON r.Schedule_ID = s.Schedule_ID JOIN User u ON s.User_ID = u.User_ID JOIN Position p ON u.Position_ID = p.Position_ID JOIN Department d ON p.Department_ID = d.Department_ID where d.Department_ID = "${req.depID}" and p.Position_Name = "Manager" and q.Request_ID = "${req.body.notification}"`,
    function (err, result, fields) {
      if (err) {
        throw err;
      }
      req.managerID = result[0].User_ID
      next();
    })
}

app.post("/insert/notification/manager", MiddleWare, getManagerIDForNotification, (req, res) => {
  let insert = `INSERT INTO Notification (Notification_Description, Request_ID,User_ID) VALUES ?`
  let values = [];

  values.push(["TEST Notification", req.body.notification, req.managerID])
  con.query(insert, [values], function (err, result) {
    if (err) {
      console.log("/insert/notification/manager : " + err)
      throw err;
    }
    res.json("Request Success")
  })
});


/*------------------------------Login------------------------------------*/
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

app.post("/users/authenticate", LoginMiddleWare, (req, res) => {
  const payload = {
    sub: req.body.username,
    iat: new Date().getTime(),
  };
  const SECRET = process.env.SECRETKEYS;
  res.json({ sc: jwt.encode(payload, SECRET) })
});

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


/*------------------------------Connect DB------------------------------------*/
con.connect(err => {
  app.listen(8080, () => {
    console.log('Connection success, Start server at port 8080.')
  })
})