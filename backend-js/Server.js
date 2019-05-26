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
  con.query('select concat(name," ",surname) as Name,User_ID from User where Position_ID = 1', function (err, result, fields) {
    if (err) {
      console.log("/user : "+err)
      throw err
    };
    res.json(result)
    res.end
  });
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

app.post('/period', async (req, res) => {

  let insert = "INSERT INTO Period (Period_Name,Period_Time_One,Period_Time_Two,Period_Color) VALUES ?"
  let values = req.body.period.map(period => {
    return [period.periodName, period.periodOne, period.periodTwo, period.color];
  });
  con.query(insert, [values], function(err,result) {
    if (err) {
      console.log("/period : "+err)
      throw err;
    }
    res.json(result)
  })
})

app.get('/showperiod', (req, res) => {
  con.query('select Period_ID,Period_Name,Period_Time_One,Period_Time_Two,Period_Color from Period', function (err, result, fields) {
    if(err){
      console.log("/showperiod : "+err)
      throw err
    };
    res.json(result)
  })
})

app.post('/deleteperiod', async (req, res)  =>  {
  console.log(req.body.DeletePeriod)
  await con.query(`
  Delete from Schedule where Period_ID = "${req.body.DeletePeriod.Period_ID}"`, function (err, result, fields) {
    if(err){
      console.log("/deleteperiod : "+err)
      throw err
    };
  })

  await con.query(`
  Delete from Period where Period_ID = "${req.body.DeletePeriod.Period_ID}"`, function (err, result, fields) {
    if(err){
      console.log("/deleteperiod : "+err)
      throw err
    };
    res.json(result)
  })
})

app.post('/schedule', (req, res) => {
  console.log("Accept")

  let insert = "INSERT INTO Schedule (User_ID, Date, Period_ID) VALUES ?"
  let values = [];

  Object.keys(req.body.addperiodscheduletodb).forEach(e => {
    req.body.addperiodscheduletodb[e].forEach(event => {
      let key = e.split(',');
      values.push([ key[0], key[1], event.Period_ID])
      
    })
  })

  con.query(insert, [values], function (err, result, fields) {
      if (err) {
        console.log("/period : "+err)
        res.end(result)
        throw err;
      }
      res.json(result);
    });
})

app.get('/showschedule', (req, res) => {
  con.query('select s.Period_ID,s.User_ID,s.Date,p.Period_ID,p.Period_Time_One,p.Period_Time_Two,p.Period_Color from Schedule s join Period p on s.Period_ID = p.Period_ID', function (err, result, fields) {
    if (err) {
      console.log("/showschedule : "+err)
      throw err
    };
    res.json(result)
  });
})

app.post('/schedule/delete', (req,res) => {
  console.log(req.body.DeletePeriodDB)
  con.query(`Delete FROM Schedule where User_ID = "${req.body.DeletePeriodDB.User_ID}" and Date = "${req.body.DeletePeriodDB.Date}" and Period_ID = "${req.body.DeletePeriodDB.Period_ID}"` , function (err, result, fields) {
    if(err){
      console.log("/deleteperiod : "+err)
      throw err
    };
    res.json(result)
  }) 
})

con.connect(err => {
  app.listen(8080, () => {
    console.log('Connection success, Start server at port 8080.')
  })
})


