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
        
    unique = (function () {
        var count = 1;
        return function () {
            return count++;  
        };
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
            var _self = this,
                mapid = unique(),
            
                centroids = {},
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
                    .style("opacity", 0),
                
                linkedmaps = [],
                hoverstatesfuncs = {},
                
                compareTo;
            
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
                            var sum = 0, missingsum = 0;
                            group.values.forEach(function(year) {
                                // calculate for given years
                                if(years.indexOf(year.key) != -1) {
                                    keys.forEach(function (key) {
                                        sum += year.stats[key];
                                    });
                                    sum = sum/keys.length;
                                } 
                                // calculate excluded years (for range)
                                else {
                                    keys.forEach(function (key) {
                                        missingsum += year.stats[key];
                                    });
                                    missingsum = missingsum/keys.length;
                                }
                            });
                            group[mapid] = group[mapid] || {};
                            group[mapid].mergedstats = sum/years.length;
                            group[mapid].allstats = (sum + missingsum)/group.values.length;
                        });
                        
                        // compute maximum percentage over all states and set a gradient color range
                        var min = d3.min(groups, function(group) { return +group[mapid].allstats; }), 
                            max = d3.max(groups, function(group) { return +group[mapid].allstats; }),
                            colorScale = d3.scale.linear()
                                .range(['white', 'darkred'])
                                .domain([min, max]),
                            relBackScale = d3.scale.linear()
                                .range(['darkred', 'grey', 'darkgreen'])
                                .domain([-1, 0, 1]);
                        
                        groups.forEach(function(group) {
                            var statecode = group.key.toUpperCase(),
                                jq_self = $(target.node()).find("g.state-path[code='"+statecode+"']"),
                                d3_self = target.select("g.state-path[code='"+statecode+"']"),
                                jq_tooltip = $(tooltip.node()),
                                d3_tooltip = tooltip;
                            
                            
                            // unbind all previous events
                            jq_self.unbind();
                            
                            // color the state according to the stats
                            d3_self
                                .transition()
                                .duration(400)
                                .style("fill", colorScale(group[mapid].mergedstats));
                            
                            hoverstatesfuncs[group.key.toUpperCase()] = function (show, origin) {
                                var show = (show === undefined ? true : show),
                                    origin = (origin === undefined ? false : origin);
                                
                                if (show === true) {
                                    var centroid = centroids[statecode],
                                        x = centroid[0], // + target.position().left;
                                        y = centroid[1]; //+ target.position().top;
                                    
                                    // save color and fill with active color
                                    if (jq_self.data("fill") === undefined) jq_self.data("fill", jq_self.css("fill"));
                                    d3_self.transition().duration(200).style("fill", "orange");
                                    
                                    if (origin !== false) {
                                        var diff = group[mapid].mergedstats - group[origin.getId()].mergedstats,
                                            rel_diff = diff / group[origin.getId()].mergedstats;
                                        d3_tooltip
                                            .style("background", relBackScale(Math.max(Math.min(1, rel_diff), -1)))
                                            .style("color", "white")
                                            .html(toStringFunc(group, diff));
                                    } else {
                                        d3_tooltip
                                            .style("background", "lightgrey")
                                            .style("color", "black")
                                            .html(toStringFunc(group, group[mapid].mergedstats));
                                    }
                     
                                    var position = {
                                        "top": jq_self.position().top - jq_tooltip.outerHeight() + "px",
                                        "left": jq_self.position().left + jq_self[0].getBoundingClientRect().width + "px"
                                    };
                                    if (parseFloat(jq_tooltip.css("opacity")) > 0)
                                        jq_tooltip.stop().animate(position, 200);    
                                    else 
                                        jq_tooltip.css(position);
                                    
                                    d3_tooltip.transition().duration(200).style("opacity", 1);
                                } else {
                                    d3_self.transition().duration(200).style("fill", jq_self.data("fill"));
                                    d3_tooltip.transition().duration(500).style("opacity", 0);
                                }                                
                            }
                            
                            // shows tooltip on mouseover
                            jq_self.on("mouseover", function() {
                                hoverState(statecode);
                            }).on("mouseout", function(d) {
                                hoverState(statecode, false);
                            });
                            
                            // State interaction with other graphs
                            jq_self.on("click", (function (group) {
                                return function(e) {
                                    console.log("clicked on", group.key);
                                }
                            }(group)));
                        });
                    });                   
                },
                hoverState = function (code, show, origin) {
                    var show = (show == undefined ? true : show),
                        origin = (origin == undefined ? false : origin);
                    
                    if (hoverstatesfuncs[code] === undefined) return console.error("Hover func undefined");
                    
                    hoverstatesfuncs[code](show, origin);
                    
                    if (origin === false || origin.getId() === mapid) {
                        linkedmaps.forEach(function (map) {
                            map.hoverState(code, show, public_methods);
                        });
                    }
                },
                compareStatisticTo = function (map) {
                    compareTo = map;
                },
                public_methods = {
                    linkMaps: function (maps) {
                        if (Object.prototype.toString.call(maps) !== '[object Array]')
                            maps = [maps];
                        
                        $.extend(linkedmaps, maps);
                    },
                    hoverState: function (code, show, origin) {
                        hoverState(code, show, origin);
                    },
                    getId: function () { return mapid; },
                    compareStatisticTo: compareStatisticTo,
                    showStatistic: showStatistic
                };
            
            // Initialize the map and data
            initialize();
            
            return public_methods;
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