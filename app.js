const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect("mongodb://127.0.0.1:27017/wikiDB")
  .then(() => {
    console.log("MongoDB Connected...");
  })
  .catch((err) => {
    console.log(err);
  });

const articleSchema = {
  title: String,
  content: String,
};

const Article = mongoose.model("Article", articleSchema);

app
  .route("/articles")
  .get((req, res) => {
    Article.find()
      .then((foundArticles) => {
        res.send(foundArticles);
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
    });
    newArticle
      .save()
      .then(() => {
        res.send("Successfully saved a new article.");
      })
      .catch((err) => {
        res.send(err);
      });
  })
  .delete((req, res) => {
    Article.deleteMany()
      .then(() => {
        res.send("All articles DELETED.");
      })
      .catch((err) => {
        res.send(err);
      });
  });

/////// For specific article is below code
app
  .route("/articles/:articleTitle")
  .get((req, res) => {
    Article.findOne({ title: req.params.articleTitle })
      .then((foundArticle) => {
        if (foundArticle) res.send(foundArticle);
        else res.send("Nothing found with given article title");
      })
      .catch((err) => {
        res.send(err);
      });
  })

  .put((req, res) => {
    if (!req.body.title || req.body.title.trim() === "") {
      return res.status(400).send("Title is missing. Update not performed.");
    }
    Article.findOneAndUpdate(
      { title: req.params.articleTitle },
      {
        title: req.body.title,
        content: req.body.content,
      },
      { overwrite: true }
    ).then((result) => {
      if (result)
        res.send(
          "New Article for " + req.params.articleTitle + " hase been saved "
        );
      else
        res.send(
          'Article with title "' + req.params.articleTitle + '" does not exist'
        );
    });
  })

  .patch((req,res)=>{
    Article.findOneAndUpdate(
      {title:req.params.articleTitle},
      {$set:req.body}
    ).then((result)=>{
      if(result)
      res.send("Article with title \""+req.params.articleTitle+"\" has been updated.")
      else
      res.send("Coud NOT update the article \""+req.params.articleTitle+"\" !!!!!!")
    })
  })

  .delete((req,res)=>{
    Article.deleteOne({title:req.params.articleTitle})
    .then((result)=>{
      if(result.deletedCount>0){
      res.send("Article with title \""+req.params.articleTitle+"\" has been Deleted.")
      }
      else
      res.send("Coud NOT Delete the article \""+req.params.articleTitle+"\" !!!!!! Because it doeas not exist")
    })

  })


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
