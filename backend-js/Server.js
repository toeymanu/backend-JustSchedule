const express = require('express')
var cors = require('cors')
const app = express()
app.use(cors())
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "18.216.14.150",
  user: "UserManage",
  password: "jsplus1",
  database: "jsplus",
  // port: "8889",
  // socketPath: "localhost:/Applications/MAMP/tmp/mysql/mysql.sock"
});

app.get('/users', (req, res) => {
    con.query('select concat(name,surname) as Name from User where Position_ID = 1', function (err, result, fields) {
      if (err) {
        console.log(err)
        throw err
      };
      console.log(result);
      res.json(result)
    });
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

con.connect(err=> {
  app.listen(8080, () => {
    console.log('Connection success, Start Mamp server at port 8080.')
  })
})