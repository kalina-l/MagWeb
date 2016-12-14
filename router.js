var controller = require('./controller');

module.exports = function (app) {
  app.get('/', controller.indexAction);
  app.get('/:category?/:article?', controller.indexAction);
  app.get('/', controller.indexAction);
  app.get('/', controller.indexAction);
  app.get('/', controller.indexAction);
  app.get('/', controller.indexAction);
};
