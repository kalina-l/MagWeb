var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var articleSchema = Schema({
  _id: String,
  author: String,
  category: String,
  headline: String,
  shortText: String,
  newsText: String,
  url: String,
  visibility: Number,
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

var Article  = mongoose.model('Article', articleSchema);
var Author = mongoose.model('Author', authorSchema);
var Image  = mongoose.model('Image', imageSchema);
var Link = mongoose.model('Link', linkSchema);
var Category  = mongoose.model('Category', categorySchema);

module.exports = {
  Article: Article,
  Author: Author,
  Image: Image,
  Link: Link,
  Category: Category
}
