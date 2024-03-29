function makeParallelSets(data, states, years, variables, target, width, height) {
    if(states.length != years.length) return console.error("states and years must be of equal length!");
    if(variables.length < 2) return console.error("you must provide at least two variables!");
    
    // list of cultural variables, needed for filtering later
    var culturals = ["jazz", "classical", "opera", "musical", "play", "ballet", "dance", "artmuseum", "park", "books"];
    
    var chart = d3.parsets()
        .dimensions(variables)
        .width(width)
        .height(height);
                                                    
    var vis = target.append("svg")
        .attr("width", chart.width())
        .attr("height", chart.height());
    
    temp = [];
    
    // selects the data for the provided state/year tuples
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
    
    // filters the don't know or left blank fields from the cultural variables
    variables.forEach(function(cat) {
        if(culturals.indexOf(cat) != -1) {
            data2 = data2.filter(function(d) { return d[cat] == "yes" || d[cat] == "no"; });
        }
    });

    vis.datum(data2).call(chart);
}
