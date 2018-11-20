String.prototype.toDate = function() {
  var date = new Date(this);
  //remove time
  date = date.toLocaleDateString();
  return new Date(date);
};

var GLOBALS = {};

GLOBALS.dimens = {
  w: $("#vizDiv").width() * 0.95,
  h: $("#vizDiv").height() * 0.95
};
GLOBALS.padding = { x: 40, y: 20 };
GLOBALS.small = false;

GLOBALS.tip = d3
  .tip()
  .attr("class", "d3-tip")
  .html(function(d) {
    console.log(d);
    return d;
  });

function getAxesDomain() {
  var data =
    (angular &&
      angular.element($("[ng-controller=dataController]")) &&
      angular.element($("[ng-controller=dataController]")).scope() &&
      angular.element($("[ng-controller=dataController]")).scope()
        .globalLocMonthData) ||
    [];
  // console.log(data);
  GLOBALS.earliestDate = d3.min(data, function(d) {
    var currentDate = d.date.toDate() || GLOBALS.earliestDate;
    return currentDate;
  });
  GLOBALS.latestDate = d3.max(data, function(d) {
    var currentDate = d.date.toDate() || GLOBALS.latestDate;
    return currentDate;
  });
  // console.log(GLOBALS);

  GLOBALS.minPrice = d3.min(data, function(d) {
    // console.log(d.requestscount);
    return parseInt(d.requestscount);
  });
  // console.log(GLOBALS.minPrice);
  GLOBALS.maxPrice = d3.max(data, function(d) {
    return parseInt(d.requestscount);
  });

  // console.log(GLOBALS.minPrice, GLOBALS.maxPrice);
}
function setAxesScales() {
  var xScale = (GLOBALS.xScale =
    d3.time
      .scale()
      .domain([GLOBALS.earliestDate, GLOBALS.latestDate])
      .range([0 + GLOBALS.padding.x, GLOBALS.dimens.w - GLOBALS.padding.x]) ||
    GLOBALS.xScale);

  var xAxis = (GLOBALS.xAxis = d3.svg.axis());
  xAxis
    .scale(xScale)
    .orient("bottom")
    .ticks(3);
  console.log(GLOBALS.minPrice, GLOBALS.maxPrice);
  //if user did not input min, use 0.  no max, use highest price from data.
  var yScale = (GLOBALS.yScale =
    d3.scale
      .linear()
      .domain([GLOBALS.minPrice || 0, GLOBALS.maxPrice || GLOBALS.maxPrice])
      .range([GLOBALS.dimens.h - GLOBALS.padding.y, GLOBALS.padding.y]) ||
    GLOBALS.yScale);
  var yAxis = (GLOBALS.yAxis = d3.svg.axis());
  yAxis
    .scale(yScale)
    .orient("left")
    .ticks(5);
}

function setGraphDimens(create) {
  console.log("set");
  var dimens = (GLOBALS.dimens = {
    w: $("#vizDiv").width() * 0.95,
    h: $("#vizDiv").height() * 0.95
  });
  var padding = GLOBALS.padding;

  if (create) {
    var svg = (GLOBALS.svg = d3
      .select("#vizDiv")
      .append("svg")
      .attr("width", dimens.w)
      .attr("height", 300));
  } else {
    GLOBALS.svg.attr("height", dimens.h).attr("width", dimens.w);
  }

  getAxesDomain();
  setAxesScales();
}
$(document).ready(function() {
  angular.element($("[ng-controller=dataController]")).scope();
  drawInitialViz = function() {
    setGraphDimens("create");
    var svg = GLOBALS.svg;
    createAxes(GLOBALS.svg);
  };
  drawInitialViz();

  var dimens = (GLOBALS.dimens = {
    w: $("#vizDiv").width() * 0.95,
    h: $("#vizDiv").height() * 0.95
  });

  function createAxes(svg) {
    //adds axes
    svg
      .append("g")
      .attr("class", "x axis")
      .attr(
        "transform",
        "translate(0," + (GLOBALS.dimens.h - GLOBALS.padding.y) + ")"
      )
      .call(GLOBALS.xAxis);

    svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + GLOBALS.padding.x + ",0 )")
      .call(GLOBALS.yAxis);
  }

  drawPoints = function(svg) {
    var data = angular.element($("[ng-controller=dataController]")).scope()
      .globalLocMonthData;
    var xScale = GLOBALS.xScale;
    var yScale = GLOBALS.yScale;
    var tip = GLOBALS.tip;

    GLOBALS.svg.call(tip);

    GLOBALS.svg
      .selectAll(".dataPoint")
      .data(data)
      .enter()
      .append("a")
      .attr("xlink:href", function(d) {
        return "#" + data.indexOf(d);
      })
      .append("circle")
      .attr("class", "dataPoint")
      .attr("cx", function(d) {
        console.log(d);
        var currentDate = d.date.toDate();
        console.log(currentDate);
        console.log(xScale(currentDate));
        return xScale(currentDate);
      })
      .attr("cy", function(d) {
        return yScale(d.requestscount);
      })
      .attr("r", function(d) {
        return 7;
      })
      .attr("id", function(d) {
        return d.id;
      })
      .attr("fill-opacity", 0.6)
      .attr("fill", "green")

      .on("mouseover", function(d) {
        d3.select(this)
          .transition()
          .duration(500)
          .attr("r", 10)
          .attr("class", "hover dataPoint");
        tip.show(d);
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .transition()
          .duration(500)
          .attr("r", 2)
          .attr("class", "dataPoint");
        tip.hide(d);
      })

      //after showing point minimize
      .transition()
      .duration(1000)
      .attr("fill", "black")
      .attr("fill-opacity", 1)
      .attr("r", "2");
  };
});
