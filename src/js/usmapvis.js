var usmapvis = usmapvis || (function ($, d3, undefined) {
    /*
    * Default map settings
    */
    var defaults = {
        width: 1000,
        height: 600
    },    
    /*
    *   Shared Data
    */
    id_name_map = { 0: null },                
    short_name_id_map = { 0: null },
    data_dfd = $.Deferred(),
        
    init_data = (function () {
        // Get us state names and codes
        d3.tsv("data/us-state-names.tsv", function(error, names) {
            names.forEach(function (name) {
                id_name_map[name.id] = name;
                short_name_id_map[name.code] = name.id;
            });
        }); 
        
        // Get raw data
        d3.tsv("data/SPPA82-12-filtered.tsv", function(data) {
            // groups all data by state
            var groups = d3.nest()
                .key(function(d) {return d.fips_state})
                .key(function(d) {return d.year})
                .entries(data);
            
            // Set groupname
            groups.forEach(function (group, i) {
                group.name = id_name_map[short_name_id_map[group.key.toUpperCase()]].name;
            });
            
            data_dfd.resolve(groups);
        });
    }()),
    /*
    * Creates Us Map for visualisation
    */
    createMap = function (target, opts) {
        return (function (target, opts) {
            // Set options
            opts = $.extend({}, defaults, opts);
            opts.radius = Math.min(opts.width, opts.height) / 3;
            
            if (target === undefined || !(target instanceof d3.selection)) return console.error("no d3 target given");  
            
            // declare variables
            var centroids = {},
                centered,
            
                projection = d3.geo.albersUsa()
                    .scale(opts.width)
                    .translate([opts.width / 2, opts.height / 2 + 20]),

                path = d3.geo.path()
                    .projection(projection),
            
                svg = target.append("svg")
                    .attr("width", opts.width)
                    .attr("height", opts.height),
                g = svg.append("g"),
            
                tooltip = target
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
            
            var initialize = function () {   
                    createUsMap();                    
                },
                
                createUsMap = function () {
                    // create visual map
                    d3.json("data/us.json", function(error, us) {
                        function clicked(d) {
                        }
                        
                        g.append("g")
                            .attr("class", "states")
                            .selectAll("path")
                            .data(topojson.feature(us, us.objects.states).features)
                            .enter()
                            .append("g")
                            .attr("class","state-path")
                            .attr("state", function(d) {
                                return id_name_map[d.id].name;
                            })
                            .attr("code", function(d) {
                                return id_name_map[d.id].code;
                            });
                        
                        svg.selectAll('.state-path')
                            .append("path")
                            .attr("d", path)
                            .attr("centroid", function(d) {
                                centroids[id_name_map[d.id].code] = path.centroid(d);
                            });
                        
                        g.append("path")
                            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                            .attr("class", "state-borders")
                            .attr("d", path);
                    });
                },
                
                showStatistic = function (keys, years, toStringFunc) {
                    if (typeof toStringFunc !== "function") return console.error("no toString function given for tooltip");
                
                    data_dfd.done(function (groups) {
                        
                        // aggregates the percentages for the selected types of cultural activities and selected years
                        groups.forEach(function(group) {
                            var sum = 0;
                            group.values.forEach(function(year) {
                                if(years.indexOf(year.key) != -1) {
                                    keys.forEach(function (key) {
                                        sum += year.stats[key];
                                    });
                                    sum = sum/keys.length;
                                }
                            });
                            group.mergedstats = sum/years.length;
                        });
                        
                        // compute maximum percentage over all states and set a gradient color range
                        var min = d3.min(groups, function(group) { return +group.mergedstats; }), 
                            max = d3.max(groups, function(group) { return +group.mergedstats; }),
                            colorScale = d3.scale.linear()
                                .range(['white', 'darkred'])
                                .domain([min, max]);
                        
                       
                        groups.forEach(function(group) {
                            var $state = $(target.node()).find("g.state-path[code='"+group.key.toUpperCase()+"']"),
                                d3state = target.select("g.state-path[code='"+group.key.toUpperCase()+"']");
                            
                            // unbind all previous events
                            $state.unbind();
                            
                            // color the state according to the stats
                            d3state
                                .transition()
                                .duration(400)
                                .style("fill", colorScale(group.mergedstats));
                            
                            // shows tooltip on mouseover
                            $state.on("mouseover", function() {
                                var statecode = $(this).attr("code"),
                                    state = $(this).attr("state"),
                                    centroid = centroids[statecode],
                                    x = centroid[0]; // + target.position().left;
                                    y = centroid[1]; //+ target.position().top;
                 
                                tooltip.html(toStringFunc(group, group.mergedstats))
                                    .style("left", x + "px")
                                    .style("top", y - 20 + "px");
                                tooltip.transition().duration(200).style("opacity", 1);
                            }).on("mouseout", function(d) {
                                tooltip.transition().duration(500).style("opacity", 0);
                            });
                            
                            // State interaction with other graphs
                            $state.on("click", (function (s) {
                                return function(e) {
                                    console.log("clicked on", s.key);
                                }
                            }(group)));
                        });
                    });                   
                };
            
            // Initialize the map and data
            initialize();
            
            return {
                getStates: function () {
                    
                },
                showStatistic: showStatistic
            };
        }(target, opts));
    },
        
    createStatistic = function (key, statFunc) {
        if (typeof statFunc !== "function") return console.error("No statistics function given");
    
        data_dfd.done(function (groups) {
            groups.forEach( function(state) {
                state.values.forEach(function(year) {
                    year.stats = year.stats || {};
                    year.stats[key] = statFunc(year);
                });
            });
        });
    };
    
    return {
        createMap: createMap,
        createStatistic: createStatistic
    };    
}(jQuery, d3));