function makePie(data, state, year, variable, target, width, height) {
    var radius = Math.min(width, height) / 2;
    
    // nest by category to find all categories in all selected state/year data
    // this is necessary to provide a consistent coloring over multiple pie charts
    var data2 = [];
    data.forEach(function (value) {
        value.values.forEach(function (vals) {
            $.merge(data2, vals.values);
        });
    });
    var catnest = d3.nest()
        .key(function(d) { return d[variable]; })
        .entries(data2);
    var cats = [];
    catnest.forEach(function(cat) {
        cats.push(cat.key);
    });
        
    // set the color picker and match it to the domain of all categories determined above
    var color = d3.scale.category20().domain(cats);
    
    var pie = d3.layout.pie()
        .value(function(d) { return d.value; })
        .sort(null);
    
    var arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 20);
    
    var svg = target.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
    // selects the data for the correct state/year tuple and nests by variable
    var temp;
    data.forEach(function(s) {
            if (s.key == state) {
                s.values.forEach(function(y) {
                    if (y.key == year) {
                        temp = {"name": s.name, "values":(d3.nest()
                            .key(function(d) { return d[variable]; }).sortKeys(d3.ascending)
                            .entries(y.values)) }
                    }
                });
            }
        });
    
    var workingdata = computePercentages(temp.values);
    
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
        .attr("fill", function(d, i) { return color(d.data.key); })
        // add a tooltip to the pie charts
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
    
    // add a div with a description of the pie chart data
    description.html(variable + " distribution in " + temp.name + " (" + year + ")");
    var position = {
        "top": $(svg.node()).position().top - height/2 - 20 + "px",
        "left": $(svg.node()).position().left - width/2 + (width - $(description.node()).width())/2 + "px"
    };
    $(description.node()).css(position);
    description.transition().duration(200).style("opacity", 1);

    // shows a smooth transition when the pie data change, we dont use this though
    function change(data) {
        path = path.data(pie(data)); // compute the new angles
        path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
    }

    path.transition()
        .duration(500)
        .attr("fill", function(d, i) { return color(d.data.key); })
        .attr("d", arc)
        .each(function(d) { this._current = d; }); // store the initial angles
    
    // function to set the value of the objects to the percentage of persons that fall in that category
    function computePercentages(data) {
        // compute percentages for each variable category
        var total = d3.sum(data, function(d) { return d.values.length; } );
        data.forEach(function(cat) {
            cat.value = cat.values.length / total * 100;
        });
        
        return data;
    }
    
    
}

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}
