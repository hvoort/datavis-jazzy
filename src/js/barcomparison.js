function makeBarComparison(data, states, years, variable, target, w, h) {
    if(states.length != years.length) return console.error("states and years must be of equal length!");
    var data2 = [];
    
    for(var i = 0; i < states.length; i++) {
        data.forEach(function(state) {
            if (state.key == states[i]) {
                state.values.forEach(function(year) {
                    if (year.key == years[i]) {
                        data2[i] = {"key": states[i] + " (" + years[i] + ")", "values": d3.nest()
                            .key(function(d) { return d[variable]; }).sortKeys(d3.ascending)
                            .entries(year.values) }
                        var total = d3.sum(data2[i].values, function(d) { return d.values.length; } );
                        data2[i].values.forEach(function(cat) {
                            cat.value = cat.values.length / total * 100;
                        });
                    }
                });
            }
        })
    }
    
    var n = states.length;
    var m = data2[0].values.length;
    
    var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;
    
    var y = d3.scale.linear()
        .domain([0, 100])
        .range([height, 0]);
    
    var xlabels = [];
    for(var i = 0; i < data2[0].values.length; i++) {
        xlabels[i] = data2[0].values[i].key;
    }
    
    var x0 = d3.scale.ordinal()
        .domain(xlabels)
        .rangeBands([0, width], .2);
    
    var x1 = d3.scale.ordinal()
        .domain(d3.range(m))
        .rangeBands([0, x0.rangeBand()]);
    
    var z = d3.scale.category10();
    
    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
    var svg = target.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("svg:g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    function test(dataz) {
        var res = [];
        dataz.forEach(function(dat) {
            res.push(dat.value);
        });
        return res;
    }
            
    svg.append("g").selectAll("g")
        .data(data2)
      .enter().append("g")
        .style("fill", function(d, i) { return z(i); })
        .attr("transform", function(d, i) { return "translate(" + x1(i) + ",0)"; })
      .selectAll("rect")
        .data(function(d,i) { return d.values; })
      .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("height", function(d) { return y(d.value); })
        .attr("x", function(d) { return x0(d.key); })
        .attr("y", function(d) { return height - y(d.value); });
    
        var div = target.append("div").style("border", "2px solid").style("padding-bottom", "10px").style("padding-left", "10px").style("width", "120px").style("height", states.length * 40 + 55 + "px");
        div.append("h3").html("Legend");
        var legend = div.append("div")
                .append("svg")
                .append("g");
    
        legend.append("h1").html("Legend");
    
        legend.selectAll("div")
            .data(data2)
            .enter()
            .append("rect")
            .style("fill", function(d, i) { return z(i); })
            .attr("width", 30)
            .attr("height", 35)
            .attr("y", function(d,i) { return i*40; });
    
        legend.selectAll("div")
            .data(data2)
            .enter()
            .append("text")
            .attr("y", function(d,i) { return i*40 + 22.5; })
            .attr("x", 40)
            .text(function(d) { return d.key });

}
