function makeParallelSets(data, states, years, variables, target) {
    var culturals = ["jazz", "classical", "opera", "musical", "play", "ballet", "dance", "artmuseum", "park", "books"];
    
    var chart = d3.parsets()
        .dimensions(variables)
        .width(1600)
        .height(800);
                                                    
    var vis = target.append("svg")
        .attr("width", chart.width())
        .attr("height", chart.height());
    
    var data2 = [];
    data.values.forEach(function (value) {
        $.merge(data2, value.values);
    });
    
    var filtered;
    if(states.length > 0) {
        filtered = data2.filter(function(d) { return states.indexOf(d.fips_state) != -1 });
    }
    filtered = filtered || data2;
    if(years.length > 0) {
        filtered = filtered.filter(function(d) { return years.indexOf(d.year) != -1 });
    }
    filtered = filtered || data2;
    
    if(variables.length == 0) {
        return console.error("you must provide at least one variable!");
    }
    
    variables.forEach(function(cat) {
        if(culturals.indexOf(cat) != -1) {
            filtered = filtered.filter(function(d) { return d[cat] == "yes" || d[cat] == "no"; });
        }
    });
    
    vis.datum(filtered).call(chart);
}
