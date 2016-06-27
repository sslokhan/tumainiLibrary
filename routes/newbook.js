var request = require("request");
var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');


var url="http://isbndb.com/api/v2/json/63JEP95R/book/9780849303159";
    request({
    url: url,
    json: true
    }, function (error, response, body) {
          if (!error && response.statusCode === 200) {
                console.log(body.data[0].isbn13) // Print the json response
              }
    });
