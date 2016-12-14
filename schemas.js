var mongoose = require('mongoose')
  , Schema = mongoose.Schema

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
}
