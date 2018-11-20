var express = require("express");
var app = express();

var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
// var databaseURL =
// "mongodb://admin:Fitadmin@ds121696.mlab.com:21696/exercise-journal";
// var ObjectId = require("mongodb").ObjectId;

var request = require("request");

var bodyParser = require("body-parser");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

var cors = require("cors");
app.use(cors());

app.get("/", function(req, res) {
  res.sendfile("index.html");
});

app.get("/date", function(req, res) {
  request(
    "https://api.smartcountry-hacks.de/itdz/stats/firstfreeday/",
    function(error, response, body) {
      var availableDays = JSON.parse(body);

      console.log(availableDays.length);
      availableDays.forEach(function(day) {
        console.log(day.date);
      });
      res.send(availableDays);
    }
  );
});

app.get("/test", function(req, res) {
  request(
    "https://api.smartcountry-hacks.de/itdz/stats/firstfreeday/2018-11-14",
    function(error, response, body) {
      var globalStringData = [];
      var globalData = {};
      globalData.after = {};

      var data = JSON.parse(body);

      var service = data.actions;
      // console.log(service);

      // console.log(Object.keys(service));
      var keys = Object.keys(service);
      // console.log(keys);

      keys.forEach(function(k) {
        // console.log(k);
        // console.log(service[k]);
        globalData[k] = {};

        var times = service[k].time;
        // console.log(times);
        /*

          00:01: {
            BA_Charlottenburg-Wilmersdorf2: "23",
            BA_Friedrichshain-Kreuzberg2: "30+",
            BA_Lichtenberg2: "0",
            BA_Marzahn-Hellersdorf2: "0",
            BA_Mitte2: "27",
            BA_Neukoelln2: "0",
            BA_Pankow2: "0",
            BA_Reinickendorf2: "21",
            BA_Spandau2: "13",
            BA_Steglitz-Zehlendorf2: "0",
            BA_Tempelhof-Schoeneberg2: "0",
            BA_Treptow-Koepenick2: "0",
            Berlin_Gesamt: "0"
        */

        var timeKey = Object.keys(times);
        // console.log(timeKey); //'23:46'
        // console.log(times);
        timeKey.forEach(function(t) {
          // console.log(t);
          // console.log(times[t]);
          if (!globalData[k]["11-14-2018"]) {
            globalData[k]["11-14-2018"] = {};
          }

          var detailedTimesForDay = times[t];

          var cities = Object.keys(detailedTimesForDay);
          cities.forEach(function(c) {
            // console.log(c);
            // console.log(detailedTimesForDay[c]);

            if (!globalData[k]["11-14-2018"][c]) {
              globalData[k]["11-14-2018"][c] = {};
            } else {
            }

            var wait = detailedTimesForDay[c];
            globalData[k]["11-14-2018"][c][t] = wait;

            if (wait === "30+") {
              // console.log("Over 30 ", c, t);
            }

            console.log(k, "2018-11-14", c, t, wait);

            var debugString = k + " 2018-11-14 " + c + " " + t + " " + wait;

            var currentDate = "2018-11-14";
            var currentMonthNum = currentDate.split("-")[1];
            var currentDayNum = currentDate.split("-")[2];

            var afterDate = parseInt(currentDayNum) + parseInt(wait);
            if (afterDate > 30) {
              currentDate =
                "2018-" +
                (parseInt(currentMonthNum) + 1) +
                "-" +
                (parseInt(afterDate) - 30);
            }
            if (!globalData.after[k]) {
              globalData.after[k] = {};
            }
            if (!globalData.after[k][currentDate]) {
              globalData.after[k][currentDate] = {};
            }
            if (!globalData.after[k][currentDate][c]) {
              globalData.after[k][currentDate][c] = [];
            }

            globalData.after[k][currentDate][c].push(t);

            globalStringData.push(debugString);
          });
        });
      });
      console.log(
        globalStringData.sort(function(a, b) {
          if (a > b) {
            return 1;
          }
          if (a < b) {
            return -1;
          }
        })
      );
      console.log(globalData);

      // res.send(data);
      res.send(globalData);
    }
  );
});

app.get("/style.css", function(req, res) {
  res.sendfile("style.css");
});

app.get("/controller.js", function(req, res) {
  res.sendfile("controller.js");
});

/*
  app.get("/ex", function(req, res) {
    MongoClient.connect(
      databaseURL,
      function(err, client) {
        if (client) {
          console.log("Connected to client");
          //console.log(client);
          var db = client.db("exercise-journal");

          console.log("Database");
          //console.log(db);

          var workoutCollection = db.collection("workouts");
          console.log("Collection");
          //console.log(workoutCollection);

          workoutCollection.find({}).toArray(function(err, results) {
            if (results) {
              console.log(results);
              res.send(results);
            }
          });
        } else {
          console.log("Error connecting to Database");
          console.log(err);
        }
      }
    );
  });

  app.post("/ex", function(req, res) {
    MongoClient.connect(
      databaseURL,
      function(err, client) {
        if (client) {
          console.log("---POST:Connected to client");

          var db = client.db("exercise-journal");
          var workoutCollection = db.collection("workouts");

          console.log(req.body);
          workoutCollection.insert(req.body, function(err, results) {
            if (err) {
              console.log("Insert workout error");
              console.log(err);
              res.status(400).send(err);
            } else {
              console.log("Successful insert");
              console.log(results);
              res.send(req.body);
            }
          });
        } else {
          console.log("Error connecting to Database");
          console.log(err);
        }
      }
    );
  });

  app.post("/update/:exId", function(req, res) {
    MongoClient.connect(
      databaseURL,
      function(err, client) {
        if (client) {
          console.log("---POST:Connected to client");

          var db = client.db("exercise-journal");
          var workoutCollection = db.collection("workouts");

          var copy = req.body;
          delete copy._id;
          var o_id = new ObjectId(req.params.exId);

          workoutCollection.update({ _id: o_id }, { $set: copy }, function(
            err,
            results
          ) {
            if (err) {
              console.log("Edit Search workout error");
              console.log(err);
              res.status(400).send(err);
            } else {
              console.log("Successful edit search");
              console.log(results);
              res.send(copy);
            }
          });
        } else {
          console.log("Error connecting to Database");
          console.log(err);
        }
      }
    );
  });

  app.post("/delete/:exId", function(req, res) {
    MongoClient.connect(
      databaseURL,
      function(err, client) {
        if (client) {
          console.log("---POST:Connected to client");

          var db = client.db("exercise-journal");
          var workoutCollection = db.collection("workouts");

          var o_id = new ObjectId(req.params.exId);

          workoutCollection.deleteOne({ _id: o_id }, function(err, results) {
            if (err) {
              console.log("Edit Search workout error");
              console.log(err);
              res.status(400).send(err);
            } else {
              console.log("Successful edit search");
              console.log(results);
              res.send(results);
            }
          });
        } else {
          console.log("Error connecting to Database");
          console.log(err);
        }
      }
    );
  });
*/
app.listen(process.env.PORT || 3000);
