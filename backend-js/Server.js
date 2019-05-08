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
  // port: "8889",
  // socketPath: "localhost:/Applications/MAMP/tmp/mysql/mysql.sock"
});

app.get('/users', (req, res) => {
  con.query('select concat(name," ",surname) as Name from User where Position_ID = 1', function (err, result, fields) {
    if (err) {
      console.log(err)
      throw err
    };
    console.log(result);
    res.json(result)
  });
})

app.get('/addperiod', (req,res) => {
  con.query('select Period_Name,Period_Time_One,Period_Time_Two from Period', function (err,result,fields) {
    if(err) {
      console.log(err);
      throw err
    };
    console.log(result);
    res.json(result)
  })
})

app.post('/period', (req, res) => {
  console.log(req.body)
  // res.send(200)
  req.body.period.forEach(e => {
    console.log(e);
    con.query(`
  insert into Period (Period_ID,Period_Name,Period_Time_One,Period_Time_Two) values('1',"${e.periodName}","${e.periodOne}","${e.periodTwo}")
  `, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.json(result);
      });
  })
})

app.get('/showperiod', (req, res) => {
  con.query('select Period_Name,Period_Time_One,Period_Time_Two from Period', function (err, result, fields) {
    if(err){
      console.log(err)
      throw err
    };
    console.log(result);
    res.json(result)
  })
})

app.get('/company', (req, res) => {
  con.query('select c.Company_Name from Company c join Department d on c.Company_ID = d.Company_ID join Position p on d.Department_ID = p.Department_ID where p.Position_Name = "Tester"', function (err, result, fields) {
    if (err) {
      console.log(err)
      throw err
    };
    console.log(result);
    res.json(result)
  });
})

app.get('/department', (req, res) => {
  con.query('select d.Department_Name from Company c join Department d on c.Company_ID = d.Company_ID join Position p on d.Department_ID = p.Department_ID where p.Position_Name = "Tester"', function (err, result, fields) {
    if (err) {
      console.log(err)
      throw err
    };
    console.log(result);
    res.json(result)
  });
})

con.connect(err => {
  app.listen(8080, () => {
    console.log('Connection success, Start Mamp server at port 8080.')
  })
})


