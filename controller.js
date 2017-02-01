var schemas = require('./schemas');
var News = schemas.News;
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

var currentTime = Date.now();
function getCurrentTime () {
  currentTime = Date.now();
}

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
     if (req.body.imageType == 'newsImage' || req.body.imageType == 'newsImageFormat2' || req.body.imageType == 'newsImageFormat3') {
      callback(null, './public/img/news');
    } else if (req.body.imageType == 'profileImage' || req.body.imageType == 'vitaImageFormat2' || req.body.imageType == 'vitaImageFormat3' || req.body.imageType == 'pressImageFormat2' || req.body.imageType == 'pressImageFormat3') {
      callback(null, './public/img/actorPhotos');
    }
  },
  filename: function (req, file, callback) {
    getCurrentTime();
    if (req.body.imageType == 'newsImage' || req.body.imageType == 'newsImageFormat2' || req.body.imageType == 'newsImageFormat3') {
      callback(null, 'news-' + currentTime + '.jpg');
    } else if (req.body.imageType == 'contactImage') {
      callback(null, 'contact.jpg');
    } else {
      callback(null, req.body.actorName + '-' + currentTime + '.jpg');
    }

  }
});

var upload = multer({ storage : storage}).single('image');


function deleteImage (toDelete, type, callback) {

  var suffixes = ['-small.jpg', '-medium.jpg', '-large.jpg'];

  if (type == 'news') {
    var pathBase = './public/img/news/' + toDelete;
    var count = 0;
    suffixes.forEach(function(suffix) {
      var pathToImage = pathBase+suffix;
      count++;
      if (fileExists(pathToImage)) {
        fs.unlinkSync(pathToImage);
        console.log('Unlinked & deleted: ' + pathToImage);
      }
      if (count == 3) {
        return callback(toDelete + ' deleted.');
      }
    })
  } else {
    Image.findOneAndRemove({ filename: toDelete }, function(err) {
      if (err) {
        console.log(err);
      } else {
        var pathBase = './public/img/actorPhotos/' + toDelete;
        if (type == 'newsFirstEntryImage') {
          pathBase = './public/img/news/' + toDelete;
        }
        var count = 0;
        suffixes.forEach(function(suffix) {
          var pathToImage = pathBase+suffix;
          count++;
          if (fileExists(pathToImage)) {
            fs.unlinkSync(pathToImage);
            console.log('Unlinked & deleted: ' + pathToImage);
          }
          if (count == 3) {
            return callback(toDelete + ' deleted.');
          }
        })
      }
    });
  }
}

function shrinkImage (url, type, callback) {

  var baseUrl = './public/img/actorPhotos/';
  if (type == 2) {
    baseUrl = './public/img/news/';
  }
  var dimensions = sizeOf(baseUrl + url + '.jpg');
  console.log(dimensions.width, dimensions.height);
  if (dimensions.width > 2000) {

    var factor = dimensions.width/2000; // 2500/2000 = 1,25
    var newHeight = dimensions.height/factor;

    easyimg.resize({
        src:baseUrl+ url + '.jpg', dst:baseUrl + url + '.jpg',
        width: 2000, height:newHeight,
        quality: 90
    }).then(
      function(imageSmall) {
        console.log('Resized and cropped: ' + imageSmall.width + ' x ' + imageSmall.height);
        return callback('Resized');
      },
      function (err) {
        console.log(err);
      }
    );

  } else {
    return callback('Not resized');
  }
}

var newsOne = [];
var newsOneImages = [];

function getNewsOne () {

  var firstEntryImages = [];
  var imageCount = 0;

  Image.find({type: 3}).sort({position: 'asc'}).exec(function(err, images) {
    if (images) {
      newsOneImages = [];
      images.forEach(function(image) {
        firstEntryImages.push(image);
        imageCount++;
        if (imageCount == images.length) {
          newsOneImages = firstEntryImages;
        }
      });
    } else {
      newsOneImages = [];
    }

  });

  News.findOne({position: 404}, function(err,obj) {
    if (obj) {
      newsOne = [];
      newsOne.push(obj.headline);
      newsOne.push(obj.newsText);
      newsOne.push(obj.linkName);
      newsOne.push(obj.link);
    } else {
      newsOne = [];
    }
  });
}

getNewsOne ();

module.exports = {
  indexAction: indexAction,
  articleAction: articleAction,
  categoryAction: categoryAction,
  authorAction: authorAction,
  officeNewsAction: officeNewsAction,
  officeNewsEntryAction: officeNewsEntryAction,
  officeSaveNewsEntryAction: officeSaveNewsEntryAction,
  officeSaveNewsImageAction: officeSaveNewsImageAction,
  officeNewsFirstEntryAction: officeNewsFirstEntryAction,
  officeNewsSaveFirstEntryAction: officeNewsSaveFirstEntryAction,
  officeImageUploadAction: officeImageUploadAction,
  officeImageDeleteAction: officeImageDeleteAction,
  officeImageCropAction: officeImageCropAction,
  officeCropImageAction: officeCropImageAction,
  changeNewsSequenceAction: changeNewsSequenceAction
};

function indexAction (req, res) {

  var data = {};
  var newsArray = [];
  var count = 0;

  data['prePath'] = 'empty';

  News.find({}).sort({position: 'asc'}).exec(function(err, newsEntries) {
    if (newsEntries.length == 0) {
      data['allNews'] = newsArray;
      res.render('news', data);
    }
    newsEntries.forEach(function(newsEntry) {
      newsArray.push(newsEntry);
      count++;
      if (count == newsEntries.length) {
        data['allNews'] = newsArray;
        data['firstEntryImages'] = newsOneImages;

        data['headlineDB'] = newsOne[0] || '';
        data['newsTextDB'] = newsOne[1] || '';
        data['linkNameDB'] = newsOne[2] || '';
        data['linkDB'] = newsOne[3] || '';

        res.render('news', data);
      }
    })
  });

}

function articleAction (req, res) {
  var data = {};
  data['prePath'] = 'empty';

  News.findOne({_id: req.params.article}, function(err,obj) {

    if (err) {
      console.log(err);
    } else if (obj) {

      data['headlineDB'] = obj.headline || '';
      data['newsTextDB'] = obj.newsText || '';
      data['categoryDB'] = obj.category || '';
      data['smallNewsTextDB'] = obj.smallNewsText || '';
      data['linkNameDB'] = obj.linkName || '';
      data['linkDB'] = obj.link || '';
      data['linkNameDB2'] = obj.linkName2;
      data['linkDB2'] = obj.link2 || '';
      data['authorDB'] = obj.author || '';
      data['imageDB'] = obj.image;
      data['typeDB'] = obj.type;
      data['currentEntry'] = obj._id;
      data['currentPosition'] = obj.position;
      res.render('news-entry', data);
    }

  });

}

function categoryAction (req, res) {
  res.render('category');
}

function authorAction (req, res) {
  res.render('index');
}

function officeNewsAction (req, res) {

    var data = {};
    data['prePath'] = '/office';
    var newsArray = [];
    var count = 0;

    News.find({}).sort({position: 'asc'}).exec(function(err, newsEntries) {
      if (newsEntries.length == 0) {
        data['allNews'] = newsArray;
        res.render('office/news', data);
      }
      newsEntries.forEach(function(newsEntry) {
        newsArray.push(newsEntry);
        count++;
        if (count == newsEntries.length) {
          data['allNews'] = newsArray;
          res.render('office/news', data);
        }
      })
    });

}


function officeNewsFirstEntryAction (req, res) {

  var data = {};
  var imageArray = [];
  data['prePath'] = '/office';
  var imageCount = 0;

  var regex = /<br\s*[\/]?>/gi;

  data['imageType'] = 1;
  Image.find({type: 3}).sort({position: 'asc'}).select('-_id').exec(function(err, images) {
    if (images.length == 0) {
      data['images'] = imageArray;
      findNews()
    } else {
      images.forEach(function(image) {
        imageArray.push(image);
        imageCount++;
        if (imageCount == images.length) {
          data['images'] = imageArray;
          findNews()
        }
      });
    }
  });

  function findNews () {
    News.findOne({position: 404}, function(err,obj) {
      if (obj) {
        data['headlineDB'] = obj.headline.replace(regex, "\n");
        data['newsTextDB'] = obj.newsText.replace(regex, "\n");
        data['linkNameDB'] = obj.linkName;
        data['linkDB'] = obj.link;
      } else {
        data['headlineDB'] = '';
        data['newsTextDB'] = '';
        data['linkNameDB'] = '';
        data['linkDB'] = '';
      }

      res.render('office/news-first-entry', data);
    });
  }
}

function officeNewsSaveFirstEntryAction (req, res) {

  var data = {};
  data['prePath'] = '/office';

  var newHeadline = req.body.headline;
  newHeadline = newHeadline.replace(/(?:\r\n|\r|\n)/g, '<br />');

  var newNewsText = req.body.newsText;
  newNewsText = newNewsText.replace(/(?:\r\n|\r|\n)/g, '<br />');

  var newsObj = {
    _id: 'firstNews',
    headline: newHeadline,
    newsText: newNewsText,
    link: req.body.link,
    linkName: req.body.linkName,
    position: 404
  }

  News.findOne({position: 404}, function(err, newsEntry) {
    if (err) {
      console.log(err);
    } else if (newsEntry) {
      News.update({position: 404}, newsObj, function (err) {
        if(err) {
          console.log(err);
        }
        console.log('FirstNewsEntry updated.');
        getNewsOne ();
        res.redirect('back');
      });
    } else {
      News.create(newsObj, function(err, obj) {
        if(err) {
          console.log(err);
        }
        if (obj) {
          console.log('FirstNewsEntry created.');
          getNewsOne ();
          res.redirect('back');
        }
      });
    }

  });




}

function officeNewsEntryAction (req, res) {

  var data = {};
  data['prePath'] = '/office';
  data['currentEntry'] = 'new';

  var regex = /<br\s*[\/]?>/gi;
  var startRed = '<span class="red-text">';
  var endRed = '</span>';
  var startAfterRep = '-rot';
  var endAfterRep = 'rot-';

  if (req.params.a == 'new') {
    res.render('office/news-entry', data);
  } else {
    News.findOne({_id: req.params.a}, function(err,obj) {

      var newsText = obj.newsText || '';
      newsText = newsText.replace(regex, "\n");
      newsText = newsText.replace(startRed, startAfterRep);
      newsText = newsText.replace(endRed, endAfterRep);

      var smallNewsText = obj.smallNewsText || '';
      smallNewsText = smallNewsText.replace(regex, "\n");
      smallNewsText = smallNewsText.replace(startRed, startAfterRep);
      smallNewsText = smallNewsText.replace(endRed, endAfterRep);

      var linkName = obj.linkName || '';
      linkName = linkName.replace(startRed, startAfterRep);
      linkName = linkName.replace(endRed, endAfterRep);
      linkName = linkName.replace('>>> ', '');

      var linkName2 = obj.linkName2 || '';
      linkName2 = linkName2.replace(startRed, startAfterRep);
      linkName2 = linkName2.replace(endRed, endAfterRep);
      linkName2 = linkName2.replace('>>> ', '');

      data['headlineDB'] = obj.headline.replace(regex, "\n");
      data['newsTextDB'] = newsText;
      data['categoryDB'] = obj.category;
      data['smallNewsTextDB'] = smallNewsText;
      data['linkNameDB'] = linkName;
      data['linkDB'] = obj.link || '';
      data['linkNameDB2'] = linkName2;
      data['linkDB2'] = obj.link2 || '';
      data['authorDB'] = obj.author || '';
      data['imageDB'] = obj.image;
      data['typeDB'] = obj.type;
      data['currentEntry'] = obj._id;
      data['currentPosition'] = obj.position;
      res.render('office/news-entry', data);
    });
  }

}

function officeSaveNewsEntryAction (req, res) {

    var newHeadline = req.body.headline;
    newHeadline = newHeadline.replace(/(?:\r\n|\r|\n)/g, '<br />');
    newHeadline = newHeadline.replace('-rot', '<span class="red-text">');
    newHeadline = newHeadline.replace('rot-', '</span>');

    var newNewsText = req.body.newsText;
    newNewsText = newNewsText.replace(/(?:\r\n|\r|\n)/g, '<br />');
    newNewsText = newNewsText.replace('-rot', '<span class="red-text">');
    newNewsText = newNewsText.replace('rot-', '</span>');

    var newSmallNewsText = req.body.smallNewsText;
    newSmallNewsText = newSmallNewsText.replace(/(?:\r\n|\r|\n)/g, '<br />');
    newSmallNewsText = newSmallNewsText.replace('-rot', '<span class="red-text">');
    newSmallNewsText = newSmallNewsText.replace('rot-', '</span>');

    var newNewsLinkName = req.body.linkName;
    newNewsLinkName = '>>> ' + newNewsLinkName;
    newNewsLinkName = newNewsLinkName.replace('>>> -rot', '<span class="red-text"> >>> ');
    newNewsLinkName = newNewsLinkName.replace('rot-', '</span>');

    var newNewsLinkName2 = req.body.linkName2;
    newNewsLinkName2 = '>>> ' + newNewsLinkName2;
    newNewsLinkName2 = newNewsLinkName2.replace('>>> -rot', '<span class="red-text"> >>> ');
    newNewsLinkName2 = newNewsLinkName2.replace('rot-', '</span>');

    //var redirectUrl = '/office/imageCrop/newsImage_news';

    var newsObj = {
      _id: req.body.currentNewsEntry,
      headline: newHeadline,
      category: req.body.category,
      newsText: newNewsText,
      smallNewsText: newSmallNewsText,
      link: req.body.link,
      linkName: newNewsLinkName,
      link2: req.body.link2,
      linkName2: newNewsLinkName2,
      author: req.body.author,
      position: req.body.newsPosition,
      type: req.body.newsType
    }

    if (req.body.currentNewsEntry == 'new') {
      getCurrentTime();
      newsObj['_id'] = currentTime;
      News.create(newsObj, function(err, obj) {
        if(err) {
          console.log(err);
        }
        if (obj) {
          console.log('NewsEntry updated - ' + req.body.currentNewsEntry);
          res.redirect('/office/news/eintrag_' + obj._id);
        }
      });
    } else {
      News.update({_id: req.body.currentNewsEntry}, newsObj, function (err) {
        if(err) {
          console.log(err);
        }
        console.log('NewsEntry updated - ' + req.body.currentNewsEntry);
        res.redirect('/office/news/eintrag_' + req.body.currentNewsEntry);
      });
    }

    // if new image --> cropImage
    // else redirect to news
}

function officeSaveNewsImageAction (req, res) {
  upload(req,res,function(err) {
    if(err) {
        return res.end("Error uploading file.");
    }
    console.log("File is uploaded");
    deleteImage(req.body.currentImage, 'newsImage', function(response){
      console.log(response);
    })

    var redirectUrl = '/office/imageCrop/newsImage_news';
    var imageUrlName = req.file.filename.replace('.jpg', '');

    shrinkImage(imageUrlName, 2, function(response){
      console.log(response);
      News.update({_id: req.body.currentNewsEntry}, {image: imageUrlName}, function (err) {
        if(err) {
          console.log(err);
        }
        console.log('NewsEntry updated - ' + req.body.currentNewsEntry);
        var string = encodeURIComponent(imageUrlName);
        res.redirect(redirectUrl+'/?imgName=' + string);
      });
    })

  });
}

function officeImageCropAction  (req, res) {
  console.log('im here');
  var data = {};
  var imgUrl = '';
  var newImgName = req.query.imgName;
  if (req.params.a == 'newsImageFormat2' || req.params.a == 'newsImageFormat3') {
    imgUrl = '/img/news/'+ newImgName;
    data['imageType'] = 'newsFirstEntry';
  } else if (req.params.b == 'news') {
    imgUrl = '/img/news/'+ newImgName;
    data['imageType'] = 'news';
    data['refForRedirect'] = newImgName;
  } else {
    imgUrl = '/img/actorPhotos/' + newImgName;
    if (req.params.a == 'vitaImageFormat2' || req.params.a == 'vitaImageFormat3') {
      data['imageType'] = 'images';
    } else if (req.params.a == 'pressImageFormat2' || req.params.a == 'pressImageFormat3') {
      data['imageType'] = 'pressImages';
    } else {
      data['imageType'] = 'profileImage';
    }
    data['refForRedirect'] = req.params.b;
  }

  data['imageUrl'] = imgUrl;

  if (req.params.a == 'profileImage') {
    data['dimensionsWidth'] = 900;
    data['dimensionsHeight'] = 900;
    res.render('office/image-crop', data);
  } else if (req.params.a == 'vitaImageFormat2' || req.params.a == 'pressImageFormat2' || req.params.a == 'newsImageFormat2' || req.params.a == 'newsImage') {
    data['dimensionsWidth'] = 1800;
    data['dimensionsHeight'] = 1200;
    res.render('office/image-crop', data);
  } else if (req.params.a == 'vitaImageFormat3' || req.params.a == 'pressImageFormat3' || req.params.a == 'newsImageFormat3') {
    data['dimensionsWidth'] = 900;
    data['dimensionsHeight'] = 1200;
    res.render('office/image-crop', data);
  }
}

function officeCropImageAction (req, res) {

  var scale = req.body.imageScaleData;
  var newX = req.body.imageXData;
  var newY = req.body.imageYData;
  var url = req.body.imageUrlData;

  var cropWidth = req.body.cropWidth;
  var cropHeight = req.body.cropHeight;

  var dimensions = sizeOf('./public/' + url + '.jpg');
  var newWidth = dimensions.width * scale;
  var newHeight = dimensions.height * scale;

  var newXT = (newWidth/2)-(cropWidth/2);
  var newYT = (newHeight/2)-(cropHeight/2);
  //newX = newX - newXT;
  //newY = newY - newYT;

  easyimg.rescrop({
      src:'./public'+ url + '.jpg', dst:'./public' + url + '-large.jpg',
      width:newWidth, height:newHeight,
      cropwidth:cropWidth, cropheight:cropHeight,
      gravity: 'NorthWest',
      quality: 60,
      x:newX, y:newY
  }).then(
    function(image) {
      easyimg.rescrop({
          src:'./public'+ url + '.jpg', dst:'./public' + url + '-medium.jpg',
          width:((newWidth/3)*2), height:((newHeight/3)*2),
          cropwidth:((cropWidth/3)*2), cropheight:((cropHeight/3)*2),
          gravity: 'NorthWest',
          quality: 60,
          x:((newX/3)*2), y:((newY/3)*2)
      }).then(
        function(imageMedium) {
          easyimg.rescrop({
              src:'./public'+ url + '.jpg', dst:'./public' + url + '-small.jpg',
              width:(newWidth/3), height:(newHeight/3),
              cropwidth:(cropWidth/3), cropheight:(cropHeight/3),
              gravity: 'NorthWest',
              quality: 60,
              x:(newX/3), y:(newY/3)
          }).then(
            function(imageSmall) {
              console.log('Resized and cropped: ' + imageSmall.width + ' x ' + imageSmall.height);
              fs.unlinkSync('./public/' + url + '.jpg');
              console.log('Original image deleted.');
              if (req.body.imageType == 'news') {
                News.findOne({image: req.body.refForRedirect}, function(err,obj) {
                  console.log();
                  res.redirect('/office/news/eintrag_'+obj._id);
                });
              } else if (req.body.imageType == 'newsFirstEntry') {
                res.redirect('/office/news/ersterEintrag');
              } else {
                Actor.findOne({actorUrl: req.body.refForRedirect}, function(err,obj) {
                  console.log();
                  var currentGender = 'schauspieler';
                  if (obj.gender = 2) {
                    currentGender = 'schauspielerinnen';
                  }
                  if (req.body.imageType == 'profileImage') {
                    res.redirect('/office/'+currentGender+'/'+req.body.refForRedirect);
                  } else {
                    res.redirect('/office/'+currentGender+'/'+req.body.refForRedirect+'/'+req.body.imageType);
                  }
                });

              }

            },
            function (err) {
              console.log(err);
            }
          );
          console.log('Resized and cropped: ' + imageMedium.width + ' x ' + imageMedium.height);
        },
        function (err) {
          console.log(err);
        }
      );
      console.log('Resized and cropped: ' + image.width + ' x ' + image.height);
    },
    function (err) {
      console.log(err);
    }
  );
}


function changeNewsSequenceAction (req, res) {

  var forEachCount = 0;

  News.find({}, function(err, newsEntries) {
    if (err) {
      console.log(err);
    }
    newsEntries.forEach(function(newsEntry) {
      var newsPosition = req.body[newsEntry._id];
      News.update({_id: newsEntry._id}, {position: newsPosition}, function(err, news) {
      });
      forEachCount++;
      if (forEachCount == newsEntries.length) {
        res.redirect('back');
      }
    });
  });
}

function officeImageUploadAction  (req, res) {
  upload(req,res,function(err) {
    if(err) {
        return res.end("Error uploading file.");
    }
    console.log("File is uploaded");
    var redirectUrl = '/office/imageCrop/' + req.body.imageType + '_' + req.body.actorName;
    var imageUrlName = req.file.filename.replace('.jpg', '');

    if (req.body.imageType == 'profileImage') {
      Actor.findOne({actorUrl: req.body.actorName}, function (err, actorObj) {
          if (err) {
              console.log(err);
          } else if (actorObj) {

            deleteImage(req.body.profileImageUrl, 'actorPhoto', function(response){
              console.log('Old profile image deleted');
            })

            var newImage = new Image({
              _refActor: actorObj._id,
              position: 0,
              type: 0,
              filename: imageUrlName,
              format:1
            });

            newImage.save(function (err) {
              if (err) return handleError(err);
              shrinkImage(imageUrlName, 1, function(response){
                console.log(response);
                Image.findOne({ filename: imageUrlName }).populate('_refActor').exec(function (err, image) {
                  if (err) return handleError(err);
                  console.log('Image bolongs to %s', image._refActor.firstName);
                  var string = encodeURIComponent(imageUrlName);
                  res.redirect(redirectUrl+'/?imgName=' + string);
                });
              })
            });

          }
      });
    } else if (req.body.imageType == 'vitaImageFormat2' || req.body.imageType == 'vitaImageFormat3' || req.body.imageType == 'pressImageFormat2' || req.body.imageType == 'pressImageFormat3') {
      Actor.findOne({actorUrl: req.body.actorName}, function (err, actorObj) {
          if (err) {
            console.log(err);
          } else if (actorObj) {

            var newImage = new Image();

            if (req.body.imageType == 'vitaImageFormat2') {
              newImage = new Image({
                _refActor: actorObj._id,
                filename: imageUrlName,
                type: 1,
                position: 9999,
                format:2
              });
            } else if (req.body.imageType == 'vitaImageFormat3') {
              newImage = new Image({
                _refActor: actorObj._id,
                filename: imageUrlName,
                type: 1,
                position: 9999,
                format:3
              });
            }
            if (req.body.imageType == 'pressImageFormat2') {
              newImage = new Image({
                _refActor: actorObj._id,
                filename: imageUrlName,
                type: 2,
                position: 9999,
                format:2
              });
            } else if (req.body.imageType == 'pressImageFormat3') {
              newImage = new Image({
                _refActor: actorObj._id,
                filename: imageUrlName,
                type: 2,
                position: 9999,
                format:3
              });
            }

            newImage.save(function (err) {
              if (err) {
                  console.log(err);
              }
              shrinkImage(imageUrlName, 1, function(response){
                console.log(response);
                Image.findOne({ filename: imageUrlName }).populate('_refActor').exec(function (err, image) {
                  if (err) return handleError(err);
                  console.log('Image bolongs to %s', image._refActor.firstName);
                  console.log(redirectUrl);
                  var string = encodeURIComponent(imageUrlName);
                  res.redirect(redirectUrl+'/?imgName=' + string);
                });
              })

            });

          }
      });
    } else if (req.body.imageType == 'newsImageFormat2' || req.body.imageType == 'newsImageFormat3') {
      redirectUrl = '/office/imageCrop/' + req.body.imageType + '_news';
      var newImage = new Image();

      if (req.body.imageType == 'newsImageFormat2') {
        newImage = new Image({
          filename: imageUrlName,
          type: 3,
          position: 9999,
          format:2
        });
      } else if (req.body.imageType == 'newsImageFormat3') {
        newImage = new Image({
          filename: imageUrlName,
          type: 3,
          position: 9999,
          format:3
        });
      }

      newImage.save(function (err) {
        if (err) {
            console.log(err);
        }
        shrinkImage(imageUrlName, 2, function(response){
          console.log(response);
          var string = encodeURIComponent(imageUrlName);
          getNewsOne ();
          res.redirect(redirectUrl+'/?imgName=' + string);
        })
      });

    } else if (req.body.imageType == 'contactImage') {
      console.log('Contact image updated');
      res.redirect('back');
    }

  });
}

function officeImageDeleteAction (req, res) {
  var imageToDelete = req.body.filename;
  var type = req.body.imageType;

  deleteImage(imageToDelete, type, function(response){
    console.log(response);
    res.redirect('back');
  })
}
