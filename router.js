var controller = require('./controller');

module.exports = function (app) {
  app.get('/', controller.indexAction);
  app.get('/office', controller.officeNewsAction);
  app.get('/office/news/ersterEintrag', controller.officeNewsFirstEntryAction)
  app.post('/office/news/ersterEintrag/save', controller.officeNewsSaveFirstEntryAction)
  app.get('/office/news/eintrag_:a?', controller.officeNewsEntryAction)
  app.post('/office/news/eintrag/save', controller.officeSaveNewsEntryAction)
  app.post('/office/news/eintrag/saveImage', controller.officeSaveNewsImageAction)
  app.post('/office/news/changeSequence', controller.changeNewsSequenceAction)

  app.get('/office/imageCrop/:a?_:b?', controller.officeImageCropAction)
  app.post('/office/cropImage', controller.officeCropImageAction)

  app.post('/office/imageUpload', controller.officeImageUploadAction)
  app.post('/office/imageDelete', controller.officeImageDeleteAction)

  app.get('/article/:article?', controller.articleAction);

  app.get('/:category?/allArticles', controller.categoryAction);
  app.get('/:author?/profile', controller.authorAction);


};
