var express = require("express"),
    http = require("http");

var app = require("./lib/streamline-express")(express());

// var myErrorFunc = function(cb) {
//   setTimeout(function() {
//     cb(new Error("my e"));
//     // cb();
//   }, 1000);
// };

var myErrorFunc = function(_) {
  setTimeout(_, 1000);
  throw new Error("my e");
};

app.configure(function(){
  app.set("port", 8700);
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  // app.use(function(req, res) {
  //   throw new Error("An error");
  //   // myErrorFunc(function(err) {
  //   //   if (err) return next(err);
  //   //   next();
  //   // });
  // });
  // app.use(function(req, res, next) {
  //   console.log("yeah");
  //   next();
  // });
  // app.use(function(err, req, res, next) {
  //   console.error(err.message);
  // });

  // app.use(function(req, res, next, _) {
  //   // throw new Error("An error");
  //   myErrorFunc(_);
  // });
  // app.use(function(req, res, next) {
  //   console.log("yeah");
  //   next();
  // });
  // app.use(function(err, req, res, next, _) {
  //   console.error(err.message);
  // });
});

app.configure("development", function(){
  app.use(express.errorHandler());
});

// app.get("/", function(req, res, next) {
//   setTimeout(function() {
//     console.log("/");
//     if (!req.query.c) next("route");
//     else next();
//   }, 2000);
// }, function(req, res) {
//   console.log("next /");
//   res.send("OK");
// });
// 
// app.get("/", function(req, res) {
//   res.send("Another OK");
// });

app.get("/", function(req, res, next, _) {
  setTimeout(_, 2000);
  console.log("/");
  if (!req.query.c) next("route");
  else next();
}, function(req, res) {
  console.log("next /");
  res.send("OK");
});

app.get("/", function(req, res, _) {
  res.send("Another OK");
});

app.get("/root", function(req, res, _) {
  setTimeout(_, 1000);
  console.log("/root");
  res.send("root OK");
});

app.get("/root2", function(req, res) {
  console.log("root 2");
  res.send("root 2");
});

http.createServer(app).listen(app.get("port"), function() {
  console.log("Demo services listening on port " + app.get("port"));
});
