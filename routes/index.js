// Shehzad Lokhandwalla
var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var request = require("request-promise");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Tumaini Senior Secondary School Library System' });
});

router.get('/thelist', function(req, res){

    res.render('booklist');
  });

router.get('/thelist/data', function(req, res){
 
  // Get a Mongo client to work with the Mongo server
  var MongoClient = mongodb.MongoClient;
 
  // Define where the MongoDB server is
  var url = 'mongodb://localhost:27017/library';
 
  // Connect to the server
  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the Server', err);
  } else {
    // We are connected
    console.log('Connection established to', url);
    // Get the documents collection
    var collection = db.collection('books');
 
    // Find all books
    collection.find({}).toArray(function (err, result) {
      if (err) {
        res.send(err);
      } else if (result.length) {
        res.json({result});
      } else {
        res.send('No documents found');
      }
      //Close connection
      db.close();
    });
  }
  });
});
 
// Route to the page we can add books from using newbook.jade



//SOLVE PROBLEM OF GLOBAL VARIABLES!
var s_book_name="";
var s_author_name="";
var s_isbn13_id="";
var s_publisher_name="";
var s_category_id="";
var error="";

router.post('/searchbook', function(req, res, next){

    var isbn=req.body.isbn.trim();
    var url="http://isbndb.com/api/v2/json/63JEP95R/book/"+isbn;
    request({
    url: url,
    json: true
    }, function (error, response, body) {
          if (!error && body.data!=null && response.statusCode === 200) {
                if(body.data[0].title!=null)
                  s_book_name=body.data[0].title;
                else s_book_name="n/a";
                if(body.data[0].author_data[0]!=null)
                  s_author_name=body.data[0].author_data[0].name;
                else s_author_name="n/a";
                if(body.data[0].isbn13!=null)
                  s_isbn13_id=isbn;
                else s_isbn13_id="n/a";
                if(body.data[0].publisher_name!=null)
                  s_publisher_name=body.data[0].publisher_name;
                else s_publisher_name="n/a";
                if(body.data[0].subject_ids[0]!=null)
                  s_category_id=body.data[0].subject_ids[0].replace(/[_-]/g, " ") ;
                else s_category_id="n/a";
              }
          else 
          { 
            s_isbn13_id=isbn;
            res.redirect('/newbook');
            next();
          }
    }).then(function() {
        res.redirect('/newbook2');
      });
    });

router.get('/newbook', function(req, res){

    require('dns').resolve('www.google.com', function(err) {
      if (err) {
         error=1;
      } else {
         error="";
      }
    });

    res.render('newbook', {title: 'Add New Book', error: error, isbn: s_isbn13_id});
});

router.get('/newbook2', function(req, res){
    res.render('newbook2', {title: 'Add New Book',s_book: s_book_name, s_author: s_author_name, s_isbn13: s_isbn13_id ,s_publisher: s_publisher_name , s_category: s_category_id});
    });

router.post('/addbook', function(req, res){
 
    // Get a Mongo client to work with the Mongo server
    var MongoClient = mongodb.MongoClient;
 
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/library';
 
    // Connect to the server
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
 
        // Get the documents collection
        var collection = db.collection('books');

        collection.findOne({isbn: req.body.isbn13}, function(err, document) {
          if(document==null)
          {
            // Get the book data passed from the form
            var book1 = {isbn: req.body.isbn13, book_name: req.body.book_name, author: req.body.author,
              publisher: req.body.publisher, category: req.body.category, num: 1, checkout: 0};
     
            // Insert the book data into the database
            collection.insert([book1], function (err, result){
              if (err) {
                console.log(err);
              } else {
                // Redirect to the updated book list
                res.redirect("thelist");
              }
              // Close the database
              db.close();
            });
          }
          else 
          {
            collection.update({ isbn: req.body.isbn13 }, {$inc: {num:1}});
            res.redirect("thelist");
            db.close();
          }
        });
 
      }
    });
 
  });

router.get('/removebook', function(req, res){
    res.render('removebook', {title: 'Remove Book'});
});

router.get('/checkinout', function(req, res){
    res.render('checkinout', {title: 'Check-In OR Check-Out'});
});

router.post('/remove', function(req, res){
 
    // Get a Mongo client to work with the Mongo server
    var MongoClient = mongodb.MongoClient;
 
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/library';
 
    // Connect to the server
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
 
        // Get the documents collection
        var collection = db.collection('books');

        collection.findOne({isbn: req.body.isbn}, function(err, document) {
          if(document==null)
          {
            db.close();
            //do something to end...
          }
          else 
          {
            if(document.num>1)
              collection.update({ isbn: req.body.isbn }, {$inc: {num:-1}});
            else
              collection.deleteOne({ isbn: req.body.isbn });
            res.redirect("thelist");
            db.close();

          }
        });
 
      }
    });
 
  });


router.post('/checkout', function(req, res){
 
    // Get a Mongo client to work with the Mongo server
    var MongoClient = mongodb.MongoClient;
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/library';
    // Connect to the server
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
 
        // Get the documents collection
        var collection = db.collection('books');

        collection.findOne({isbn: req.body.isbn}, function(err, document) {
          if(document==null)
          {
            db.close();
            //do something to end...
          }
          else 
          {
            if(document.num>=1)
              collection.update({ isbn: req.body.isbn }, {$inc: {num:-1, checkout:1}});
            res.redirect("thelist");
            db.close();

          }
        });
 
      }
    });
 
  });


router.post('/checkin', function(req, res){
 
    // Get a Mongo client to work with the Mongo server
    var MongoClient = mongodb.MongoClient;
    // Define where the MongoDB server is
    var url = 'mongodb://localhost:27017/library';
    // Connect to the server
    MongoClient.connect(url, function(err, db){
      if (err) {
        console.log('Unable to connect to the Server:', err);
      } else {
        console.log('Connected to Server');
 
        // Get the documents collection
        var collection = db.collection('books');

        collection.findOne({isbn: req.body.isbn}, function(err, document) {
          if(document==null)
          {
            db.close();
            //do something to end...
          }
          else 
          {
            if(document.checkout>=1)
              collection.update({ isbn: req.body.isbn }, {$inc: {num:1, checkout:-1}});
            res.redirect("thelist");
            db.close();

          }
        });
 
      }
    });
 
  });
 
module.exports = router;
 