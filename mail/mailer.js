var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
var nodemailer = require('nodemailer')
//var schedule = require('node-schedule');
var fs = require('fs');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/magazine');
var schemas = require('../schemas');
var News = schemas.News;

var globalData = {};
var newsData = {};

function getData () {

  var data = globalData;
  var newsArray = [];
  var count = 0;

  News.find({}).sort({position: 'asc'}).exec(function(err, newsEntries) {
    if (newsEntries.length == 0) {
      data['allNews'] = newsArray;
      newsData = data;
      console.log('no data - buuuhhh');
    }
    newsEntries.forEach(function(newsEntry) {
      if (newsEntry.position != 404) {
        var tempNewsEntry = newsEntry
        var pathToImage = '../public/img/news/' + newsEntry.image + '-medium.jpg'

        function base64_encode(file) {
          // read binary data
          var bitmap = fs.readFileSync(file);
          // convert binary data to base64 encoded string
          return new Buffer(bitmap).toString('base64');
        }

        var base64str = base64_encode(pathToImage);
        tempNewsEntry.image = base64str
        newsArray.push(tempNewsEntry);
      }

      count++;
      if (count == newsEntries.length) {
        data['allNews'] = newsArray;
        newsData = data;
      }
    })
  });
}

var smtpConfig = {
    host: 'send.one.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'mail@timmitrinks.de',
        pass: 'kktXJm6R67iK[9*ZY8^7Tb'
    }
};

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(smtpConfig);

var templateDir = path.join(__dirname, 'templates', 'testmail')
var newsletter = new EmailTemplate(templateDir)

function sendMail (type, bccCount) {
  newsletter.render(newsData, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      var copys = []
      if (type == 'test' && bccCount == 999) {
        copys = ['mail@timmitrinks.de']
      }
      var mailOptions = {
          from: '"Magazine" <mail@timmitrinks.de>', // sender address
          to: '"Empfänger" <mail@timmitrinks.de>', // list of receivers
          //bcc: copys,
          subject: 'Newsletter – Magazine', // Subject line
          text: result.text, // plaintext body
          html: result.html // html body
      };
      // result.html
      // result.text
      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return console.log(error);
          }
          console.log('Message sent: ' + info.response);
      });
    }
  })
}

getData()
sendMail('test', 999)

//var i = schedule.scheduleJob('*/1 * * * *', function(){
/*
  MailTiming.findOne({mail: 'newsletter-test'}, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      var newsletterDate = new Date(result.date)
      var currentDate = new Date()
      if (newsletterDate.getYear() == currentDate.getYear() && newsletterDate.getMonth() == currentDate.getMonth() && newsletterDate.getDate() == currentDate.getDate() && newsletterDate.getHours() == currentDate.getHours() && newsletterDate.getMinutes() == currentDate.getMinutes()) {
        getData()
        setTimeout(function () {
          sendMail('test', 999)
        }, 3000);
      }
    }
  })

  MailTiming.findOne({mail: 'newsletter'}, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result) {
      var newsletterDate = new Date(result.date)
      var currentDate = new Date()

      if (newsletterDate.getYear() == currentDate.getYear() && newsletterDate.getMonth() == currentDate.getMonth() && newsletterDate.getDate() == currentDate.getDate() && newsletterDate.getHours() == currentDate.getHours()+1 && newsletterDate.getMinutes() == currentDate.getMinutes()) {
        getData()
        getPartners()
        setTimeout(function () {
          console.log(mailingPartners.length);
          for (i = 0; i < mailingPartners.length; i++) {
            sendMail('newsletter', i)
          }
        }, 3000);
      }
    }
  })

});
*/
