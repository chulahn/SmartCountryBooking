angular
  .module("app", [])

  .controller("dataController", [
    "$scope",
    "$http",
    function($scope, $http) {
      var firstFreeDayUrl =
        "https://api.smartcountry-hacks.de/itdz/stats/firstfreeday/";

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
    }
  ]);
