$(document).ready(function() {
  $("#startModal").modal();
  $("#vizDiv2").hide();
  $(".yearDiv .btn > span").click(function() {
    var year = $(this).html();
    $(".yearDiv .clicked").removeClass("clicked");
    $(this)
      .parent()
      .addClass("clicked");
    $("#year").html(year);

    var scope = angular.element($("[ng-controller=dataController]")).scope();
    switch (year) {
      case "2014":
        scope.globalSlice = scope.globalLocMonthData.slice(0, 1000);
        scope.$apply();
        updateViz();

        break;

      case "2015":
        console.log(2015);
        scope.globalSlice = scope.globalLocMonthData.slice(1000, 1200);
        scope.$apply();

        updateViz();

        break;

      case "2016":
        console.log(2016);
        scope.globalSlice = scope.globalLocMonthData.slice(1200, 1800);
        scope.$apply();

        updateViz();
        break;
    }
  });

  $(".typeDiv .btn > span").click(function() {
    var graphType = $(this).html();
    console.log(graphType);
    $(".typeDiv .clicked").removeClass("clicked");
    $(this)
      .parent()
      .addClass("clicked");

    if (graphType === "All Clients") {
      $("#vizDiv2").show();
      $("#vizDiv").hide();
    } else if (graphType === "Total Requests") {
      $("#vizDiv").show();
      $("#vizDiv2").hide();
    }
  });

  function fillModal(date, location, time) {
    $("#serviceInput").val("Anmeldung_Wohnung");
    $("#dateInput").val(date);
    $("#locationInput").val(location);
    $("#timeInput").val(time);
    $("#regModal").modal();
  }
});

angular
  .module("app", [])

  .controller("dataController", [
    "$scope",
    "$http",
    function($scope, $http) {
      $scope.testCalData = {};
      $scope.globalData = {};
      $scope.globalLocMonthData = {};
      $scope.globalSlice = {};
      var firstFreeDayUrl =
        "https://api.smartcountry-hacks.de/itdz/stats/firstfreeday/";

      $scope.fillModal = function(date, location, time) {
        $("#serviceInput").val("Anmeldung_Wohnung");
        $("#dateInput").val($("#datepicker").val());
        $("#locationInput").val(location);
        $("#timeInput").val(time);
        $("#regModal").modal();
      };

      $scope.register = function() {
        console.log("res");
        var obj = {};
        obj.service = $("#serviceInput").val();
        obj.date = $("#dateInput").val();
        obj.location = $("#locationInput").val();
        obj.time = $("#timeInput").val();
        $http.post("/sms", obj, function(req, res) {
          $("#regModal").modal("toggle");
          $("#registeredModal").modal("toggle");
          console.log(res);
        });
      };

      /*
        $http
          .get("/date")
          .success(function(data) {
            console.log("Successful connect ", data);

            var enableDays = [];

            data.forEach(function(day) {
              console.log(day.date);
              enableDays.push(day.date);
            });

            jQuery(function() {
              // var enableDays = ["7-8-2013"];
              // var enableDays = ["2018-11-08"];

              function enableAllTheseDays(date) {
                // var sdate = $.datepicker.formatDate("d-m-yy", date);
                var sdate = $.datepicker.formatDate("yy-mm-dd", date);
                if ($.inArray(sdate, enableDays) != -1) {
                  return [true];
                }
                return [false];
              }

              $("#datepicker").datepicker({
                dateFormat: "dd-mm-yy",
                beforeShowDay: enableAllTheseDays
              });
            });
          })
          .error(function(err) {
            console.log(err);
          });
      */
      $http
        .get("/test")
        .success(function(data) {
          console.log("Successful connect ", data);
          $scope.globalData = data;

          console.log(Object.keys(data.after.Anmeldung_Wohnung));
          /*
            ["2018-12-7", "2018-12-14", "2018-11-14", "2018-12-11", "2018-12-5", "2018-12-10", "2018-12-13", "2018-12-6", "2018-12-3", "2018-12-12", "2018-12-4"]
          */
          var enableDays = Object.keys(data.after.Anmeldung_Wohnung);

          // console.log(enableDays);
          console.log(data.after.Anmeldung_Wohnung["2018-11-14"]);
          $scope.testCalData = data.after.Anmeldung_Wohnung["2018-11-14"];

          // enableDays.forEach(function(d) {
          //   $scope.testCalData = data.after.Anmeldung_Wohnung[d];
          // });

          jQuery(function() {
            // var enableDays = ["7-8-2013"];
            // var enableDays = ["2018-11-08"];

            function enableAllTheseDays(date) {
              // var sdate = $.datepicker.formatDate("d-m-yy", date);
              var sdate = $.datepicker.formatDate("yy-m-d", date);
              if ($.inArray(sdate, enableDays) != -1) {
                return [true];
              }
              return [false];
            }

            $("#datepicker").datepicker({
              dateFormat: "yy-mm-d",
              beforeShowDay: enableAllTheseDays,
              onSelect: function(dateText, inst) {
                var date = $(this).val();
                $scope.$apply(function() {
                  console.log(date);
                  console.log($scope.globalData.after.Anmeldung_Wohnung);

                  console.log($scope.globalData.after.Anmeldung_Wohnung[date]);
                  $scope.testCalData =
                    $scope.globalData.after.Anmeldung_Wohnung[date];
                });
              }
            });
          });
        })
        .error(function(err) {
          console.log(err);
        });

      $http
        .get("/stats/all")
        .success(function(data) {
          console.log("Successful connect ", data);

          $scope.globalLocMonthData = data = data.sort(function(a, b) {
            // console.log(a.date.toDate(), b.date.toDate());
            if (a.date.toDate() > b.date.toDate()) {
              return 1;
            }
            if (a.date.toDate() < b.date.toDate()) {
              return -1;
            }
          });
          $scope.globalSlice = data;
          // console.log("getting axes domain");
          GLOBALS.dimens = {
            w: $("#vizDiv").width() * 0.95,
            h: $("#vizDiv").height() * 0.95
          };
          setGraphDimens();
          // getAxesDomain();
          // console.log("gotaxes in intia");
          // setAxesScales();

          resizeAxes();

          drawPoints(GLOBALS.svg);
          drawLine();
        })
        .error(function(err) {
          console.log(err);
        });
    }
  ]);
