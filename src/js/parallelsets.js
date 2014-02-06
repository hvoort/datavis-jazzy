function makeParallelSets(data, states, years, variables) {
    var culturals = ["jazz", "classical", "opera", "musical", "play", "ballet", "dance", "artmuseum", "park", "books"];
    
    var chart = d3.parsets()
        .dimensions(variables)
        .width(1600)
        .height(800);
                                                    
    var vis = d3.select("body").append("svg")
        .attr("width", chart.width())
        .attr("height", chart.height());
    
    var filtered = data.filter(function(d) { return (states.indexOf(d.fips_state) != -1) && (years.indexOf(d.year) != -1) });
    
    variables.forEach(function(cat) {
        if(culturals.indexOf(cat) != -1) {
            filtered = filtered.filter(function(d) { console.log(d[cat]); return d[cat] == "yes" || d[cat] == "no"; });
        }
    });
    
    vis.datum(filtered).call(chart);
}
