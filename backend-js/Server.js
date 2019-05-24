const express = require('express')
var cors = require('cors')
const app = express()
app.use(cors())
var mysql = require('mysql');
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var con = mysql.createConnection({
  host: "3.16.163.55",
  user: "UserManage",
  password: "jsplus1",
  database: "jsplus",
});

app.get('/users', (req, res) => {
  con.query('select concat(name," ",surname) as Name from User where Position_ID = 1', function (err, result, fields) {
    if (err) {
      console.log("/user : "+err)
      throw err
    };
    res.json(result)
    res.end
  });
})

app.get('/showperiod', (req, res) => {
  con.query('select Period_Name,Period_Time_One,Period_Time_Two from Period', function (err, result, fields) {
    if(err){
      console.log("/showperiod : "+err)
      throw err
    };
    res.json(result)
    res.end
  })
})

app.get('/company', (req, res) => {
  con.query('select c.Company_Name from Company c join Department d on c.Company_ID = d.Company_ID join Position p on d.Department_ID = p.Department_ID where p.Position_Name = "Tester"', function (err, result, fields) {
    if (err) {
      console.log("/company : "+err)
      throw err
    };
    res.json(result)
    res.end
  });
})

app.get('/department', (req, res) => {
  con.query('select d.Department_Name from Company c join Department d on c.Company_ID = d.Company_ID join Position p on d.Department_ID = p.Department_ID where p.Position_Name = "Tester"', function (err, result, fields) {
    if (err) {
      console.log("/department : "+err)
      throw err
    };
    res.json(result)
    res.end
  });
})

app.post('/period', (req, res) => {
  req.body.period.forEach(e => {
    con.query(`
  insert into Period (Period_Name,Period_Time_One,Period_Time_Two,Period_Color) values("${e.periodName}","${e.periodOne}","${e.periodTwo}","red")
  `, function (err, result, fields) {
        if (err) {
          console.log("/period : "+err)
          res.end(result)
          throw err;
        }
        res.json(result);
      });
  })
})

con.connect(err => {
  app.listen(8080, () => {
    console.log('Connection success, Start server at port 8080.')
  })
})


