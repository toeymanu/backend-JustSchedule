const express = require('express')
var cors = require('cors')
const app = express()
app.use(cors())
var mysql = require('mysql');
require('dotenv').config();
var bodyParser = require('body-parser')
const jwt = require("jwt-simple");

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

app.get('/users', (req, res) => {
  con.query('select concat(name," ",surname) as Name,User_ID from User where Position_ID = 1', function (err, result, fields) {
    if (err) {
      console.log("/user : " + err)
      throw err
    };
    res.json(result)
  });
})

app.get('/company', (req, res) => {
  con.query('select c.Company_Name from Company c join Department d on c.Company_ID = d.Company_ID join Position p on d.Department_ID = p.Department_ID where p.Position_Name = "Tester"', function (err, result, fields) {
    if (err) {
      console.log("/company : " + err)
      throw err
    };
    res.json(result)
  });
})

app.get('/department', (req, res) => {
  con.query('select d.Department_Name from Company c join Department d on c.Company_ID = d.Company_ID join Position p on d.Department_ID = p.Department_ID where p.Position_Name = "Tester"', function (err, result, fields) {
    if (err) {
      console.log("/department : " + err)
      throw err
    };
    res.json(result)
  });
})

app.get('/showperiod', async (req, res) => {
  await con.query('select * from Period', function (err, result, fields) {
    if (err) {
      console.log("/showperiod : " + err)
      throw err
    };
    res.json(result)
  })
})

app.post('/period', async (req, res) => {

  let insert = "INSERT INTO Period (Period_Name,Period_Time_One,Period_Time_Two,Period_Color) VALUES ?"
  let values = req.body.period.map(period => {
    return [period.periodName, period.periodOne, period.periodTwo, period.color];
  });
  con.query(insert, [values], function (err, result) {
    if (err) {
      console.log("/period : " + err)
      throw err;
    }
    res.json(result)
  })
})

app.get('/showschedule', (req, res) => {
  con.query('select s.Period_ID,s.User_ID,s.Date,p.Period_ID,p.Period_Time_One,p.Period_Time_Two,p.Period_Color from Schedule s join Period p on s.Period_ID = p.Period_ID', function (err, result, fields) {
    if (err) {
      console.log("/showschedule : " + err)
      throw err
    };
    res.json(result)
  });
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

app.post('/schedule', (req, res) => {
  let insert = "INSERT INTO Schedule (User_ID, Date, Period_ID) VALUES ?"
  let values = [];

  Object.keys(req.body.addperiodscheduletodb).forEach(e => {
    req.body.addperiodscheduletodb[e].forEach(event => {
      let key = e.split(',');
      values.push([key[0], key[1], event.Period_ID])

    })
  })

  con.query(insert, [values], function (err, result, fields) {
    if (err) {
      console.log("/period : " + err)
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

app.post('/register', (req, res) => {
  con.query(`INSERT INTO User (UserName, Password) VALUES ("${req.body.register.username}","${req.body.register.password}")`, function (err, result, fields) {
    if (err) {
      console.log("/register : " + err)
      throw err
    };
    res.json(result);
  })
})

app.post('/company/insert', (req, res) => {
  con.query(`INSERT INTO Company (Company_Name, Company_Mail,Company_Tel,Company_Picture) VALUES ("${req.body.createcompany.companyName}","${req.body.createcompany.companyEmail}","${req.body.createcompany.companyTel}","${req.body.companypicture}")`, function (err, result, fields) {
    if (err) {
      throw err
    };
    res.json(result);
  })
})

app.get('/company/select', (req, res) => {
  con.query('select * from Company c where c.Company_ID = 11 ', function (err, result, fields) {
    if (err) {
      throw err
    };
    res.json(result)
  });
})

/*------------------------------Login------------------------------------*/
const CheckUsernameMiddleWare = (req, res, next) => {
  var found = false;
  Boolean(found);
  con.query(`select username from User`, function (err, result, fields) {
    result.forEach(e => {
      if (e.username === req.body.username) {
        found = true;
        next();
      }
    })
    if (found != true) {
      res.json("Wrong Username or Password")
    }
  })
}

const LoginMiddleWare = (req, res, next) => {
  con.query(`select username,password from User where username = "${req.body.username}"`, function (err, result, fields) {
    if (err) {
      throw err;
    }
    if (req.body.username === result[0].username && req.body.password == result[0].password) {
      next();
    } else {
      res.json("Wrong Username or Password")
    }
  })
};

app.post("/users/authenticate", CheckUsernameMiddleWare, LoginMiddleWare, (req, res) => {
  const payload = {
    sub: req.body.username,
    iat: new Date().getTime()
  };
  const SECRET = process.env.SECRETKEYS;
  res.json({ tk: jwt.encode(payload, SECRET), name: req.body.username })
})

con.connect(err => {
  app.listen(8080, () => {
    console.log('Connection success, Start server at port 8080.')
  })
});