var mongoose = require('mongoose')
  , Schema = mongoose.Schema

<<<<<<< HEAD
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
=======
var articleSchema = ({
  _id: String,
  category: String,
  subcategory: String,
  headline: String,
  previewText: String,
  fullText: String,
  author: { type: String, ref: 'Author'},
  date: Date,
  images: [{ type: Schema.Types.ObjectId, ref: 'Image' }]
});

var imageSchema = ({
  _refArticle: { type: String, ref: 'Article'},
  caption: String,
  filename: String
});

var authorSchema = ({
  _refArticles: [{ type: String, ref: 'Article'}],
  name: String,
  biography: String,
  picture: { type: Schema.Types.ObjectId, ref: 'Image' }
});

var Article = mongoose.model('Article', articleSchema);
var Image = mongoose.model('Image', imageSchema);
var Author = mongoose.model('Author', authorSchema);

module.exports = {
  Article = Article,
  Image = Image,
  Author = Author
>>>>>>> 1132ffad2228160b46be88eb3089a03455293a0a
}
