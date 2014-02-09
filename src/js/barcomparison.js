function makeBarComparison(data, states, years, variable, target, w, h) {
    if(states.length != years.length) return console.error("states and years must be of equal length!");
    var data2 = [];
    
    // select the provided states and years from the data and introduce a nesting by the selected variable
    for(var i = 0; i < states.length; i++) {
        data.forEach(function(state) {
            if (state.key == states[i]) {
                state.values.forEach(function(year) {
                    if (year.key == years[i]) {
                        data2[i] = {"key": states[i], "name": state.name + " (" + years[i] + ")", "values": d3.nest()
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
    
    // find the highest percentual value in the data
    var max = 0;
    data2.forEach(function(state) {
        state.values.forEach(function (cat) {
            if (cat.value > max) max = cat.value;
        })
    });
    
    var n = states.length;
    var m = data2[0].values.length;
    
    var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;
    
    // range of the y-axis goes to the maximum value
    var y = d3.scale.linear()
        .domain([0, max])
        .range([height-20, 0]);
    
    var xlabels = [];
    for(var i = 0; i < data2[0].values.length; i++) {
        xlabels[i] = data2[0].values[i].key;
    }
    
    var x0 = d3.scale.ordinal()
        .domain(xlabels)
        .rangeBands([0, width], .2);
    
    // this determines the translation for each state,year tuple
    var x1 = d3.scale.ordinal()
        .domain(d3.range(n))
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
    
    // position and rotate the x-labels so they are readable for longer labels
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height-20) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("transform", function(d) {
                return "rotate(15)" 
                });
            
    svg.append("g").selectAll("g")
        .data(data2)
      .enter().append("g") 
        // translate the bars for each state,year tuple 
        .style("fill", function(d, i) { return z(i); })
        .attr("transform", function(d, i) { return "translate(" + x1(i) + ",0)"; })
      .selectAll("rect")
        .data(function(d,i) { return d.values; })
      .enter().append("rect")
        // draw the bars for each category of the state,year tuple
        .attr("width", x1.rangeBand())
        .attr("height", function(d) { return height - 20 - y(d.value); })
        .attr("x", function(d) { return x0(d.key); })
        .attr("y", function(d) { return y(d.value); });
    
        // draw a legend
        var div = target.append("div").style({
            "width": "200px",
            "height": states.length * 40 + 60 + "px",
            "position": "absolute",
            "top": "-20px",
            "left": "-240px"
        }).attr("class","card").append("div").attr("class", "cardcontent");
        div.append("h3").html("Legend").style("color", "black");
        var legend = div.append("div")
                .append("svg")
                .append("g");
    
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
            .text(function(d) { return d.name });

}
