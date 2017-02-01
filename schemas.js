var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var articleSchema = Schema({
  _id: String,
  author: String,
  category: String,
  headline: String,
  smallNewsText: String,
  newsText: String,
  position: Number,
  type: Number  // 1 FullScreen - 2 FullSplit - 3 BigDouble - 4 MediumDouble - 5 SmallDouble - 6 Small
});

var newsSchema = Schema({
  _id: String,
  author: String,
  category: String,
  headline: String,
  newsText: String,
  smallNewsText: String,
  link: String,
  linkName: String,
  link2: String,
  linkName2: String,
  image: String,
  position: Number,
  type: Number  // 1 FullScreen - 2 FullSplit - 3 BigDouble - 4 MediumDouble - 5 SmallDouble - 6 Small
});

// TODO - Article for an author
var authorSchema = Schema({
  firstName: String,
  lastName: String,
  image: String,
  url: String,
  gender: Number,
  vintage: Number,
  location: String,
  profileText: String
});

var imageSchema = Schema({
  _refArticle: { type: String, ref: 'Article'},
  type: Number,
  position: Number,
  filename: String,
  format: Number // 1=square 2=landscape 3=portrait
});

var linkSchema = Schema({
  _refArticle: { type: String, ref: 'Actor' },
  url: String,
  name: String
});

var categorySchema = Schema({
  name: String
});

var News  = mongoose.model('News', newsSchema);
var Author = mongoose.model('Author', authorSchema);
var Image  = mongoose.model('Image', imageSchema);
var Link = mongoose.model('Link', linkSchema);
var Category  = mongoose.model('Category', categorySchema);

module.exports = {
  News: News,
  Author: Author,
  Image: Image,
  Link: Link,
  Category: Category
}
