var controller = require('./controller');
var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === 'admin' && user.pass === 'password') {
    return next();
  } else {
    return unauthorized(res);
  };
};

module.exports = function (app) {
  app.get('/', controller.indexAction);
  app.get('/office', auth, controller.officeNewsAction);
  app.get('/office/news/ersterEintrag', auth, controller.officeNewsFirstEntryAction)
  app.post('/office/news/ersterEintrag/save', auth, controller.officeNewsSaveFirstEntryAction)
  app.get('/office/news/eintrag_:a?', auth, controller.officeNewsEntryAction)
  app.post('/office/news/eintrag/save', auth, controller.officeSaveNewsEntryAction)
  app.post('/office/news/eintrag/saveImage', auth, controller.officeSaveNewsImageAction)
  app.post('/office/news/changeSequence', auth, controller.changeNewsSequenceAction)

  app.get('/office/imageCrop/:a?_:b?', auth, controller.officeImageCropAction)
  app.post('/office/cropImage', auth, controller.officeCropImageAction)

  app.post('/office/imageUpload', auth, controller.officeImageUploadAction)
  app.post('/office/imageDelete', auth, controller.officeImageDeleteAction)

  app.get('/article/:article?', controller.articleAction);

  app.get('/:category?/allArticles', controller.categoryAction);
  app.get('/:author?/profile', controller.authorAction);


};
