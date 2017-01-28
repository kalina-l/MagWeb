var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var nib = require('nib');

var app = express();

function compile(str, path) {
   return stylus(str)
     .set('filename', path)
     .set('compress', true)
     .use(nib())
     .import('nib');
 }

app.set('views', './templates');
app.set('view engine', 'pug');
app.use(stylus.middleware(
  { src: __dirname + '/public/styles'
   , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({extended: false}))

require('./router')(app);

app.listen(8080, function () {
  console.log('Server listen on port 8080')
});
