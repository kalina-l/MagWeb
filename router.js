var controller = require('./controller');

module.exports = function (app) {
  app.get('/', controller.indexAction);
  app.get('/:category?/allArticles', controller.categoryAction);
  app.get('/:category?/:article?', controller.articleAction);
  app.get('/:author?/profile', controller.authorAction);
};
