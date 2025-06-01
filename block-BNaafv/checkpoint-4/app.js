var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
require('dotenv').config()


mongoose.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.dflboke.mongodb.net/`)
.catch(err=>console.log(err))

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/questions', require('./routes/questions'))

app.use((req,res,next)=>{
    res.status(404).send("page not found")
    next()
})

app.use((err,req,res,next)=>{
    res.status(404).json({"Error:":err.message})
})

module.exports = app;
