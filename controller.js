angular
  .module("app", [])

  .controller("dataController", [
    "$scope",
    "$http",
    function($scope, $http) {
      $scope.testCalData = {};
      $scope.globalData = {};
      var firstFreeDayUrl =
        "https://api.smartcountry-hacks.de/itdz/stats/firstfreeday/";
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
    }
  ]);
