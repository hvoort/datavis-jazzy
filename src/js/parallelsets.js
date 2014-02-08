function makeParallelSets(data, states, years, variables, target) {
    if(states.length != years.length) return console.error("states and years must be of equal length!");
    if(variables.length == 0) return console.error("you must provide at least one variable!");
    
    var culturals = ["jazz", "classical", "opera", "musical", "play", "ballet", "dance", "artmuseum", "park", "books"];
    
    var chart = d3.parsets()
        .dimensions(variables)
        .width(1600)
        .height(800);
                                                    
    var vis = target.append("svg")
        .attr("width", chart.width())
        .attr("height", chart.height());
    
    console.log(data);
    temp = [];
    
    for(var i = 0; i < states.length; i++) {
        data.forEach(function(state) {
            if (state.key == states[i]) {
                state.values.forEach(function(year) {
                    if (year.key == years[i]) {
                        temp.push(year.values);
                    }
                });
            }
        })
    }
    
    var data2 = [];
    temp.forEach(function (value) {
        $.merge(data2, value);
    });
    
    variables.forEach(function(cat) {
        if(culturals.indexOf(cat) != -1) {
            data2 = data2.filter(function(d) { return d[cat] == "yes" || d[cat] == "no"; });
        }
    });
    
    vis.datum(data2).call(chart);
}
