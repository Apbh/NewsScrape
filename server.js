var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


//ROUTES
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.get("/savedArticles", function(req, res) {
  res.sendFile(path.join(__dirname, "./public/savedArticles.html"));
});

//cheerio
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request

    axios.get("https://www.thestar.com/news/world.html").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("span.story__headline").each(function(i, element) {
        // Save an empty result object
        
        
        // Add the text and href of every link, and save them as properties of the result object
        var title = $(element)
        .text();
        // var link = $(element)
        // .parent("a")
        // .attr("href");
        var completeLink = "https://www.thestar.com"+ $(element).parent("a").attr("href");
        console.log("complete link:" + completeLink);
        var summary = $(element)
        .parent("a")
        .text()
        
        var result = {
          title:title,
          completeLink: completeLink,
          summary:summary,
          isSaved:false
        }

        console.log(result)

          
          db.Article.findOne({title:title}).then(function(data){
            console.log("Article already exists in database");
            if (data === null){

              db.Article.create(result)
              .then(function(dbArticle) {
                res.json(dbArticle);
              })
            }
          })
          .catch(function(err) {
            return res.json(err);
          });
        });
        // res.redirect("/allArticles");
        
      });
    });
  
  // Route to get all article from the db
  app.get("/articles", function(req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({})
    .then(function(dbArticles) {
      // If any Libraries are found, send them to the client
      console.log(dbArticles);
      res.json(dbArticles);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
  
  });

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({"_id": req.params.id})
  .populate("note")
  .then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

app.post("/articles/:id", function(req, res) {

  db.Note.create(req.body)
  .then(function(dbNote){
    return db.Article.findOneAndUpdate({"_id": req.params.id}, {$set: {note:dbNote._id}}, {new : true});
  })
  .then(function(dbArticle){
    res.json(dbArticle);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });

});

//Route for saving an article by ID
app.put("/saved/:id", function(req, res) {

  db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true }})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Route to get all saved articles
app.get("/saved", function(req,res){
  db.Article.find({isSaved:true})
  .then(function(savedArticle){
    res.json(savedArticle);
  })
  .catch(function(err){
    res.json(err);
  })
})

//Delete saved article
app.put("/delete/:id", function(req, res) {

  db.Article
    .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false }})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// //to delete all articles on the saved page
app.delete("/delete", function(req,res) {
  db.Article.deleteMany({isSaved:true})
  .then(function(data,err){
    if (err){
      console.log(err)
    } 
    else {
     res.send("saved articles deleted");
      
    }
  })
})

  // Start the server
app.listen(PORT, function() {
    console.log("App running on port: http://localhost:" + 3000);
  });
