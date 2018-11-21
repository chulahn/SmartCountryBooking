var express = require("express");
var app = express();

var mongo = require("mongodb");
var MongoClient = mongo.MongoClient;
var databaseURL = "mongodb://admin:admin1@ds039037.mlab.com:39037/smartcountry";
var ObjectId = require("mongodb").ObjectId;

var request = require("request");
var async = require("async");

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
            // if (!globalData.after[k][currentDate][c]) {
            //   globalData.after[k][currentDate][c] = [];
            // }

            if (!globalData.after[k][currentDate][t]) {
              globalData.after[k][currentDate][t] = [];
            }

            // globalData.after[k][currentDate][c].push(t);

            globalData.after[k][currentDate][t].push(c);

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

app.get("/stats", function(req, res) {
  request(
    "https://api.smartcountry-hacks.de/itdz/stats/customer/111/2016-06",
    function(error, response, body) {
      console.log(body);
      var data = JSON.parse(body);
      console.log(data);

      data.forEach(function(day) {
        console.log(day.date, day.requestscount);
      });

      res.send(data);
    }
  );
});

var days = [
  {
    subjectId: "101",
    date: "2013-01"
  },
  {
    subjectId: "101",
    date: "2013-02"
  },
  {
    subjectId: "101",
    date: "2013-03"
  },
  {
    subjectId: "101",
    date: "2013-04"
  }
];

request("https://api.smartcountry-hacks.de/itdz/stats/service", function(
  error,
  response,
  body
) {
  days = JSON.parse(body);
  // console.log(days.length);
  days = days.slice(0, 100);
});

app.get("/stats/all", function(req, res) {
  var allStats = [];

  MongoClient.connect(
    databaseURL,
    function(err, client) {
      if (client) {
        var db = client.db("smartcountry");
        var requestTable = db.collection("request");

        // requestTable.find({}).toArray(function(err, results) {
        //   console.log(results.length);
        //   res.send(results);
        // });

        async.each(
          days,
          function(day, callback) {
            // Perform operation on day here.
            console.log("Processing month " + day.date);

            var baseURL =
              "https://api.smartcountry-hacks.de/itdz/stats/customer/";
            baseURL += day.subjectId + "/";
            baseURL += day.date;

            request(baseURL, function(error, response, body) {
              if (!body) {
                console.log(day);
                callback(error, day);
              }
              var data = JSON.parse(body);
              console.log(data[0]);
              allStats = allStats.concat(data);
              callback();
            });
          },
          function(err, day) {
            // if any of the day processing produced an error, err would equal that error
            if (err) {
              // One of the iterations produced an error.
              // All processing will now stop.
              console.log("A day failed to process");
              console.log(err);
              console.log(day);
              if (err.code === "ETIMEOUT") {
              }
            } else {
              console.log("All days have been processed successfully");
              async.each(
                allStats,
                function(s, callback) {
                  console.log(s);
                  // requestTable.insert(s, function(err, results) {
                  //   if (err) {
                  //     console.log("Insert workout error");
                  //     console.log(err);
                  //     res.status(400).send(err);
                  //   } else {
                  //     console.log("Successful insert");
                  //     console.log(results);
                  //   }
                  // });
                },
                function(err, day) {
                  console.log(err);
                }
              );
              res.send(allStats);
            }
          }
        );
      } else {
        console.log("Error connecting to Database");
        console.log(err);
      }
    }
  );
});

app.get("/style.css", function(req, res) {
  res.sendfile("style.css");
});

app.get("/controller.js", function(req, res) {
  res.sendfile("controller.js");
});

app.get("/drawgraph.js", function(req, res) {
  res.sendfile("drawgraph.js");
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
