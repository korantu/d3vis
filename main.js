var width = 500;
var height = width;
var step = width / 40;

var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

svg.style({"background" : "gray"});

// *** Components:
// Hilbert (existing one)
// Server loading

var hilbert = (function() {
  // From Mike Bostock: http://bl.ocks.org/597287
  // Adapted from Nick Johnson: http://bit.ly/biWkkq
  var pairs = [
    [[0, 3], [1, 0], [3, 1], [2, 0]],
    [[2, 1], [1, 1], [3, 0], [0, 2]],
    [[2, 2], [3, 3], [1, 2], [0, 1]],
    [[0, 0], [3, 2], [1, 3], [2, 3]]
  ];
  // d2xy and rot are from:
  // http://en.wikipedia.org/wiki/Hilbert_curve#Applications_and_mapping_algorithms
  function rot(n, x, y, rx, ry) {
    if (ry === 0) {
      if (rx === 1) {
        x = n - 1 - x;
        y = n - 1 - y;
      }
      return [y, x];
    }
    return [x, y];
  }
  return {
    xy2d: function(x, y, z) {
      var quad = 0,
          pair,
          i = 0;
      while (--z >= 0) {
        pair = pairs[quad][(x & (1 << z) ? 2 : 0) | (y & (1 << z) ? 1 : 0)];
        i = (i << 2) | pair[0];
        quad = pair[1];
      }
      return i;
    },
    d2xy: function(z, t) {
      var n = 1 << z,
          x = 0,
          y = 0;
      for (var s = 1; s < n; s *= 2) {
        var rx = 1 & (t / 2),
            ry = 1 & (t ^ rx);
        var xy = rot(s, x, y, rx, ry);
        x = xy[0] + s * rx;
        y = xy[1] + s * ry;
        t /= 4;
      }
      return [x, y];
    }
  };
})();


// *** Steps:
// Plan:
// Hilbert curve
// Add/remove
// Loading from server

// Simple adding
function try_add() {
    svg.append("circle").attr("cx", width/2 ).attr("cy", height/2).attr("r", step);
}

// Data-based
function try_data() {
    svg.append("circle");
    svg.append("circle");

    var sel = svg.selectAll("circle").data([width/4, 3*width/4]);

    sel.attr("cx", function(d){return d;} ).attr("cy", function(d){return d;}).attr("r", step);
}

// Transition
function try_change_data() {
    svg.append("circle").attr("cx", width/2 ).attr("cy", height/2 ).attr("r", step);
    svg.append("circle").attr("cx", width/2 ).attr("cy", height/2 ).attr("r", step);

    svg.selectAll("circle").data( [width/4, 3*width/4]).transition().attr("cx", function(d){return d;} ).attr("cy", function(d){return d;}).attr("r", step);
}

// Timer
function try_timer() {
    svg.append("circle").attr("cx", width/2 ).attr("cy", height/2 ).attr("r", step);
    svg.append("circle").attr("cx", width/2 ).attr("cy", height/2 ).attr("r", step);

    var called = false;

    d3.timer( function () {
	if ( ! called ) {
	    svg.selectAll("circle").data( [width/4, 3*width/4]).transition().attr("cx", function(d){return d;} ).attr("cy", function(d){return d;}).attr("r", step);
	    called = true;
	}
	return false;
    });
}

// Events and mousing
function try_mouse() {
    svg.append("circle");

    svg.on("mousemove", function () {
	var xy = d3.mouse(this);

	var sel = svg.selectAll("circle").data([xy]);
	sel.transition().attr("cx", function(d) { return d[0];} ).attr("cy", function(d) { return d[1];}).attr("r", step);
    }); 
}

try_mouse();
