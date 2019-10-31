const express = require('express')
var cors = require('cors')
const app = express()
app.use(cors())
var mysql = require('mysql');
require('dotenv').config();
var bodyParser = require('body-parser')
const router = require("./routers");


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


var con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


//router
app.use("/schedule",router.route_schedule);
app.use("/user", router.route_user);
app.use("/company", router.route_company);
app.use("/department", router.route_department);
app.use("/period",router.route_period);
app.use("/position", router.route_position);

con.connect(err => {
    app.listen(8080, () => {
      console.log('Connection success, Start server at port 8080.')
    })
  })