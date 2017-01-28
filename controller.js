var schemas = require('./schemas');
var Article = schemas.Article;
var Author = schemas.Author;
var Image = schemas.Image;
var Link = schemas.Link;
var Category = schemas.Category;

var multer = require('multer');
var easyimg = require('easyimage');
var sizeOf = require('image-size');
var fs = require('fs');
var fileExists = require('file-exists');
var sizeOf = require('image-size');

module.exports = {
  indexAction: indexAction,
  articleAction: articleAction,
  categoryAction: categoryAction,
  authorAction: authorAction
};

function indexAction (req, res) {
  res.render('index');
}

function articleAction (req, res) {
  res.render('article');
}

function categoryAction (req, res) {
  res.render('category');
}

function authorAction (req, res) {
  res.render('index');
}
