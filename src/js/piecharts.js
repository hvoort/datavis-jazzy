function makePie(data, year, variable) {
    var width = 960,
        height = 500,
        radius = Math.min(width, height) / 2;
        
    var color = d3.scale.category20();
    
    var pie = d3.layout.pie()
        .value(function(d) { return d.value; })
        .sort(null);
    
    var arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 20);
    
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
    var temp = selectYear(data, year[0]);
    var workingdata = computePercentages(temp, variable);
    
    var path = svg.selectAll("path")
        .data(pie(workingdata))
        .enter()
        .append("path")
        .attr("fill", function(d, i) { return color(i); })
        .on('mouseover', function(d) {
            $("#pietooltip")
              .html(d.data.key + "<br/>" + d.data.value.toFixed(2) + "%")
              .show();
        })
        .on('mousemove', function(d) {
            $("#pietooltip")
              .css('left', d3.mouse(this)[0]+width/2)
              .css('top', d3.mouse(this)[1]+height/2)
        })
        .on('mouseout', function(d) {
            $("#pietooltip").html('').hide();
        });

    function change(data) {
        path = path.data(pie(data)); // compute the new angles
        path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
    }

    path.transition()
        .duration(500)
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc)
        .each(function(d) { this._current = d; }); // store the initial angles
    
    function computePercentages(data, variable) {
        // nest by variable
        var data2 = d3.nest()
            .key(function(d) { return d[variable]; })
            .entries(data);
        
        // compute percentages for each variable category
        var total = d3.sum(data2, function(d) { return d.values.length; } );
        data2.forEach(function(cat) {
            cat.value = cat.values.length / total * 100;
        });
        
        return data2;
    }
    
    function selectState(data, state) {
        return $.map(data, function (val) { if (val.key == state) return val; })[0].values;
    }
    
    function selectYear(data, year) {
        return $.map(data.values, function (val) { if (val.key == year) return val; })[0].values;
    }
}

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}
