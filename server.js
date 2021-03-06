var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var logger = require("morgan");

var db = require("./models");

var PORT = process.env.PORT || 4500;
var app = express();


app.use(express.static("public"));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: true
}));
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/latestNews"
// app.use(express.static("public"));

mongoose.connect(MONGODB_URI);


app.get("/scrape", function (req, res) {

  axios.get("https://www.npr.org/").then(function (response) {

    var $ = cheerio.load(response.data);

    // console.log(response.data);

    $("article .story-text").each(function (i, element) {

      var result = {};

      var articleTitle = $(this).children("a").children("h3").text().trim();
      if (!articleTitle) {
        return null;
      }


      result.title = articleTitle
      console.log("Title: :" + result.title)

      var articleLink = $(this).children("a").attr("href");
      if (articleLink.includes("http")) {
        result.link = articleLink
      } else {
        result.link = "https://www.npr.org/" + articleLink;
      }

      console.log("Link: " + result.link)
      // result.link = articleLink
      // console.log(articleLink)

      var articleSummary = $(this).children("a").children(".teaser").text().trim();

      console.log("Article Summary: " + articleSummary);
      result.summary = articleSummary;


      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          return res.json(err);
        });
    });

    res.send("NPR NEWS SCRAPE COMPLETE <a href='/'>Return to main page</a>");
  });
});


app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


app.get("/articles/:id", function (req, res) {
  db.Article.findOne({
      _id: req.params.id
    })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


app.post("/articles/:id", function (req, res) {

  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});


app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});