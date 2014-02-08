function makePie(data, year, variable, target) {
    var width = 300,
        height = 300,
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
    
    console.log(workingdata);
    
    var tooltip = target
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    var description = target
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    var jq_tooltip = $(tooltip.node());
    
    var path = svg.selectAll("path")
        .data(pie(workingdata))
        .enter()
        .append("path")
        .attr("fill", function(d, i) { return color(i); })
        .on('mouseover', function(d) {
            var position = {
                "top": $(svg.node()).position().top + d3.mouse(this)[1]+width/2 + "px",
                "left": $(svg.node()).position().left + d3.mouse(this)[0]+width/2 + "px"
            };
            if (parseFloat($(tooltip.node()).css("opacity")) > 0)
                $(tooltip.node()).stop().animate(position, 200);    
            else 
                $(tooltip.node()).css(position);
            
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(d.data.key + "<br/>" + d.value.toFixed(2) + "%");
        })
        .on('mouseout', function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });
    
    description.html(variable + " distribution in " + data.name + " (" + year[0] + ")");
    var position = {
        "top": $(svg.node()).position().top - height/2 - 20 + "px",
        "left": $(svg.node()).position().left - width/2 + (width - $(description.node()).width())/2 + "px"
    };
    
    $(description.node()).css(position);
    description.transition().duration(200).style("opacity", 1);

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
            .key(function(d) { return d[variable]; }).sortKeys(d3.ascending)
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
