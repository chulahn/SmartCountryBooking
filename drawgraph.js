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
    var tipHTML = "<span class='tip-date'>";
    tipHTML += d.date;
    tipHTML += "</span><br/>";
    tipHTML += "<span class='tip-count'>";
    tipHTML += d.requestscount;
    tipHTML += "</span>";

    return tipHTML;
  });

function getAxesDomain() {
  var data =
    (angular &&
      angular.element($("[ng-controller=dataController]")) &&
      angular.element($("[ng-controller=dataController]")).scope() &&
      angular.element($("[ng-controller=dataController]")).scope()
        .globalSlice) ||
    [];
  var data = angular.element($("[ng-controller=dataController]")).scope()
    .globalSlice;
  console.log(data.length);
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

  GLOBALS.min2 = d3.min(data, function(d) {
    // console.log(d.requestscount);
    return parseInt(d.clientscount);
  });
  // console.log(GLOBALS.minPrice);
  GLOBALS.max2 = d3.max(data, function(d) {
    return parseInt(d.clientscount);
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

  var yScale2 = (GLOBALS.yScale2 =
    d3.scale
      .linear()
      .domain([GLOBALS.min2 || 0, GLOBALS.max2 || GLOBALS.max2])
      .range([GLOBALS.dimens.h - GLOBALS.padding.y, GLOBALS.padding.y]) ||
    GLOBALS.yScale2);
  var yAxis2 = (GLOBALS.yAxis2 = d3.svg.axis());
  yAxis2
    .scale(yScale2)
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

    var svg2 = (GLOBALS.svg2 = d3
      .select("#vizDiv2")
      .append("svg")
      .attr("width", dimens.w)
      .attr("height", 300));
  } else {
    GLOBALS.svg.attr("height", dimens.h).attr("width", dimens.w);
    GLOBALS.svg2.attr("height", dimens.h).attr("width", dimens.w);
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

    GLOBALS.svg2
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + GLOBALS.padding.x + ",0 )")
      .call(GLOBALS.yAxis2);

    GLOBALS.svg2
      .append("g")
      .attr("class", "x axis")
      .attr(
        "transform",
        "translate(0," + (GLOBALS.dimens.h - GLOBALS.padding.y) + ")"
      )
      .call(GLOBALS.xAxis);
  }

  drawPoints = function(svg) {
    var data = angular.element($("[ng-controller=dataController]")).scope()
      .globalSlice;
    var xScale = GLOBALS.xScale;
    var yScale = GLOBALS.yScale;
    var tip = GLOBALS.tip;

    svg.call(tip);

    svg
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
        // console.log(d);
        var currentDate = d.date.toDate();
        // console.log(currentDate);
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

    var yScale2 = GLOBALS.yScale2;

    GLOBALS.svg2
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
        // console.log(d);
        var currentDate = d.date.toDate();
        // console.log(currentDate);
        return xScale(currentDate);
      })
      .attr("cy", function(d) {
        return yScale2(d.clientscount);
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

  drawLine = function() {
    console.log("DRAWLINE");
    var data = angular.element($("[ng-controller=dataController]")).scope()
      .globalSlice;
    // console.log(data);
    // data = data.sort(function(a, b) {
    //   console.log(a.date.toDate(), b.date.toDate());
    //   if (a.date.toDate() > b.date.toDate()) {
    //     return 1;
    //   }
    //   if (a.date.toDate() < b.date.toDate()) {
    //     return -1;
    //   }
    // });

    console.log(data);
    GLOBALS.svg
      .selectAll(".avgLine")
      .data(data)
      .enter()
      .append("line")

      .attr("x1", function(d, i) {
        if (i + 1 != data.length) {
          return GLOBALS.xScale(d.date.toDate());
        }
      })
      .attr("y1", function(d, i) {
        if (i + 1 != data.length) {
          return GLOBALS.yScale(d.requestscount);
        }
      })
      .attr("x2", function(d, i) {
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.xScale(nextElem.date.toDate());
        }
      })
      .attr("y2", function(d, i) {
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.yScale(nextElem.requestscount);
        }
      })
      .attr("class", "avgLine")
      .style("stroke", function(d, i) {
        var nextElem = data[i + 1];
        var color = "black";
        return color;
      });

    GLOBALS.svg2
      .selectAll(".avgLine")
      .data(data)
      .enter()
      .append("line")

      .attr("x1", function(d, i) {
        if (i + 1 != data.length) {
          return GLOBALS.xScale(d.date.toDate());
        }
      })
      .attr("y1", function(d, i) {
        if (i + 1 != data.length) {
          return GLOBALS.yScale2(d.clientscount);
        }
      })
      .attr("x2", function(d, i) {
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.xScale(nextElem.date.toDate());
        }
      })
      .attr("y2", function(d, i) {
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.yScale2(nextElem.clientscount);
        }
      })
      .attr("class", "avgLine")
      .style("stroke", function(d, i) {
        var nextElem = data[i + 1];
      });
  };
});

function updateViz(addingNewData) {
  var data = angular.element($("[ng-controller=dataController]")).scope()
    .globalSlice;
  updateAxes();

  var svg = GLOBALS.svg;
  var svg2 = GLOBALS.svg2;
  var dataPoints = svg.selectAll(".dataPoint").data(data);
  var lines = GLOBALS.svg.selectAll(".avgLine").data(data);

  var dp2 = svg2.selectAll(".dataPoint").data(data);
  var lines2 = svg2.selectAll(".avgLine").data(data);

  dataPoints
    .exit()
    .transition()
    .attr("r", 4)
    .attr("fill", "red")
    .transition()
    .attr("r", 0)
    .remove();
  dp2
    .exit()
    .transition()
    .attr("r", 4)
    .attr("fill", "red")
    .transition()
    .attr("r", 0)
    .remove();

  lines.exit().remove();
  lines2.exit().remove();

  addingNewData === undefined
    ? moveOldPoints()
    : moveOldPoints("addingNewData");
}

function moveOldPoints(addingNewData) {
  var scope = angular.element($("[ng-controller=dataController]")).scope();
  var data = scope.globalSlice;

  var dataPoints = GLOBALS.svg.selectAll(".dataPoint").data(data);
  var avgDataLines = GLOBALS.svg.selectAll(".avgLine").data(data);
  var dp2 = GLOBALS.svg2.selectAll(".dataPoint").data(data);
  var adl2 = GLOBALS.svg2.selectAll(".avgLine").data(data);

  var xScale = GLOBALS.xScale;
  var yScale = GLOBALS.yScale;
  var yScale2 = GLOBALS.yScale2;

  avgDataLines.each(function(d) {
    var currentLine = d3.select(this);

    currentLine
      .transition()
      .duration(500)
      .attr("x1", function(d) {
        var i = data.indexOf(d);
        console.log(i, data.length);
        var nextElem = data[i + 1];

        if (nextElem) {
          console.log(data.indexOf(d));
          return GLOBALS.xScale(d.date.toDate());
        }
      })
      .attr("y1", function(d) {
        var i = data.indexOf(d);
        console.log(i, data.length);
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.yScale(d.requestscount);
        }
      })
      .attr("x2", function(d) {
        var i = data.indexOf(d);
        console.log(i, data.length);
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.xScale(nextElem.date.toDate());
        }
      })
      .attr("y2", function(d) {
        var i = data.indexOf(d);
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.yScale(nextElem.requestscount);
        }
      })
      .style("stroke", function(d) {
        var i = data.indexOf(d);

        var nextElem = data[i + 1];
        var color = "black";

        return color;
      });
  });

  dataPoints.each(function(d) {
    var currentPoint = d3.select(this);
    var pNode = d3.select(this.parentNode);
    var currentDate = d.date.toDate();

    if (addingNewData !== undefined) {
      var currentX = parseInt(currentPoint.attr("cx"));
      var currentY = parseInt(currentPoint.attr("cy"));

      var newX = parseInt(GLOBALS.xScale(currentDate));
      var newY = parseInt(GLOBALS.yScale2(d.clientscount));

      if (currentX !== newX || currentY !== newY) {
        console.log("x ", currentX, newX, " y ", currentY, newY);

        currentPoint
          .transition()
          .duration(500)
          .attr("fill", "yellow")
          .attr("r", "10")
          .attr("fill-opacity", 0.6)
          .attr("cx", function(d) {
            return GLOBALS.xScale(currentDate);
          })
          .attr("cy", function(d) {
            return GLOBALS.yScale2(d.finalPrice);
          })
          .attr("id", function(d) {
            return d.id;
          })
          .transition()
          .duration(1000)
          .attr("fill", "black")
          .attr("r", "2")
          .attr("fill-opacity", 1);
      }
    } else {
      currentPoint
        .transition()
        .duration(500)
        .attr("cx", function(d) {
          if (GLOBALS.small === true) {
            var center = (GLOBALS.dimens.w - GLOBALS.padding.x) / 2;
            return center;
          } else {
            var currentDate = d.date.toDate();
            return GLOBALS.xScale(currentDate);
          }
        })
        .attr("cy", function(d) {
          return GLOBALS.yScale(d.requestscount);
        })
        .attr("id", function(d) {
          return d.id;
        });
    }

    pNode.attr("href", function(d) {
      return "#" + data.indexOf(d);
    });
  });

  adl2.each(function(d) {
    var currentLine = d3.select(this);

    currentLine
      .transition()
      .duration(500)
      .attr("x1", function(d) {
        var i = data.indexOf(d);
        console.log(i, data.length);
        var nextElem = data[i + 1];

        if (nextElem) {
          console.log(data.indexOf(d));
          return GLOBALS.xScale(d.date.toDate());
        }
      })
      .attr("y1", function(d) {
        var i = data.indexOf(d);
        console.log(i, data.length);
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.yScale2(d.clientscount);
        }
      })
      .attr("x2", function(d) {
        var i = data.indexOf(d);
        console.log(i, data.length);
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.xScale(nextElem.date.toDate());
        }
      })
      .attr("y2", function(d) {
        var i = data.indexOf(d);
        var nextElem = data[i + 1];

        if (nextElem) {
          return GLOBALS.yScale2(nextElem.clientscount);
        }
      })
      .style("stroke", function(d) {
        var i = data.indexOf(d);

        var nextElem = data[i + 1];
        var color = "black";

        return color;
      });
  });

  dp2.each(function(d) {
    var currentPoint = d3.select(this);
    var pNode = d3.select(this.parentNode);
    var currentDate = d.date.toDate();

    if (addingNewData !== undefined) {
      var currentX = parseInt(currentPoint.attr("cx"));
      var currentY = parseInt(currentPoint.attr("cy"));

      var newX = parseInt(GLOBALS.xScale(currentDate));
      var newY = parseInt(GLOBALS.yScale(d.clientscount));

      if (currentX !== newX || currentY !== newY) {
        console.log("x ", currentX, newX, " y ", currentY, newY);

        currentPoint
          .transition()
          .duration(500)
          .attr("fill", "yellow")
          .attr("r", "10")
          .attr("fill-opacity", 0.6)
          .attr("cx", function(d) {
            return GLOBALS.xScale(currentDate);
          })
          .attr("cy", function(d) {
            return GLOBALS.yScale2(d.clientscount);
          })
          .attr("id", function(d) {
            return d.id;
          })
          .transition()
          .duration(1000)
          .attr("fill", "black")
          .attr("r", "2")
          .attr("fill-opacity", 1);
      }
    } else {
      currentPoint
        .transition()
        .duration(500)
        .attr("cx", function(d) {
          if (GLOBALS.small === true) {
            var center = (GLOBALS.dimens.w - GLOBALS.padding.x) / 2;
            return center;
          } else {
            var currentDate = d.date.toDate();
            return GLOBALS.xScale(currentDate);
          }
        })
        .attr("cy", function(d) {
          return GLOBALS.yScale(d.clientscount);
        })
        .attr("id", function(d) {
          return d.id;
        });
    }

    pNode.attr("href", function(d) {
      return "#" + data.indexOf(d);
    });
  });
}

function updateAxes() {
  setGraphDimens();
  moveOldPoints();
  resizeAxes();
}

function resizeAxes() {
  GLOBALS.svg
    .select(".x.axis")
    .transition()
    .duration(1000)
    .attr(
      "transform",
      "translate(0," + (GLOBALS.dimens.h - GLOBALS.padding.y) + ")"
    )
    .call(GLOBALS.xAxis);
  GLOBALS.svg
    .select(".y.axis")
    .transition()
    .duration(1000)
    .attr("transform", "translate(" + GLOBALS.padding.x + ",0 )")
    .call(GLOBALS.yAxis);
}
