/**
*   COMPARE TOOL
 */

var compare = function () {
    var $contEl = $("#selected_container"),
        $selEl = $contEl.find("#selected"),
        $pEl = $selEl.find("p"),
        selected = [],
        maps = [],
        selectToString = function (select) {
            var stat = select.state[select.map.getId()].mergedstats.toFixed(2);
            return "<b>" + select.state.name + "</b> (" + select.years.join(", ") + ") <span class=\"spacer\"></span><span>" + stat + "%</span>";
        },
        selectToLi = function (select) {
            return "<li>" + selectToString(select) + "</li>";
        },
        render = function () {
            var o = "";
            $pEl.removeClass("pointer").unbind();
            if (selected.length === 0) {
                o += "Select states to compare.";
            } else {
                o += "You selected: <ul>";
                o += $.map(selected, selectToLi).join("");
                o += "</ul>";
                $pEl.addClass("pointer")
                    .on("click", compare);
            }
            $pEl.html(o);
            $contEl.animate({"opacity": 1}, 200);
        },
        compare = function () {
            var grey = $("<div \>")
                    .addClass("modal-backdrop fade in")
                    .appendTo("body")
                    .on("click", close),
                choicecard = $("#howtocomparecard")
                    .delay(600)
                    .show()
                    .animate({ "opacity": 1}, 200),
                varcard = $("#comparevarcard"),
                gocard = $("#comparegocard"),
                gohide = [gocard, varcard, choicecard];
            
            function close() {
                $.map(gohide, function (h) {
                    h.animate({"opacity": 0}, 200).hide();
                });   
                $contEl.animate({
                    "left": 0,
                    "bottom": 0,
                    "margin-left": 0
                }, 200);
                grey.removeClass("in").addClass("out").remove();
            }
            
            function changeMargin(delay) {
                var els = [choicecard, varcard, gocard],
                    marg = $.map(els, function (el) {
                        if (el.css("opacity") > 0) return - el.width() / 2;
                        else return 0;
                    }).reduce(function(a, b) { return a + b; }, 0) - (10 * (els.length - 1));
                
                $contEl.animate({
                    "margin-left": marg + "px"
                }, delay);
            }
            
            // add values
            varcard.find("select").append($.map(comparable, function (c) {
                return "<option>" + ucfirst(c) + "</option>";
            }).join(""))
            
            // reset values and handlers
            choicecard.find("input").each(function () {
                $(this).attr("checked", false);
                $(this).unbind().on("click", function () {
                    // reset values and handlers
                    var sel = varcard.find("select"),
                        go = varcard.find("select"),
                        type = $(this).val();
                    
                    if (type === "pc") sel.attr("multiple", true); 
                    else sel.attr("multiple", false); 
                    
                    // Show new card
                    if (varcard.css("opacity") > 0) {
                        varcard.animate({ "opacity": 0}, 100).animate({ "opacity": 1}, 100);
                        gocard.animate({ "opacity": 0}, 100).animate({ "opacity": 1}, 100);
                    }
                    else {
                        varcard.show().animate({ "opacity": 1}, 200);
                        gocard.show().animate({ "opacity": 1}, 200);
                    }
                    
                    
                    changeMargin(200);                                    
                    
                    // var select handler
                    gocard.find("button").unbind().on("click", function () {
                        close();
                        showComparison(type, sel.val().toLowerCase());
                    });
                });
            });
            
            $contEl.animate({
                    "left": "35%",
                    "bottom": "35%"
                }, 400);
            changeMargin(600);
            
        },
        showComparison = function (type, v) {
            var $contEl = $("#compare_container"),
                dh = $(document).height() - 40,
                dw = $(document).width() / selected.length - 40,
                min = Math.min(dw, dh),
                grey = $("<div \>")
                    .addClass("modal-backdrop fade in")
                    .appendTo("body")
                    .on("click", close);
            
            function close() {
                $("#compare_container div.card").each(function () { $(this).remove(); });
                grey.removeClass("in").addClass("out").remove();
            }
            
            function createTarget() {
                return $("<div>")
                        .addClass("card")
                        .css({
                            "opacity": 0,
                            "width": min + "px",
                            "height": min + "px"
                        })
                        .appendTo($contEl)
                        .animate({"opacity": 1}, 200);
            }
            
            switch (type) {
                case "ps":
                case "bar":
                    var $target = createTarget(),
                        d3target = d3.select($target.get(0));
                    
                    // add chart to target
                    // use selected[i].state && selected[i].years
                    
                    break;
                case "pie":
                    $.map(selected, function (select, i) {
                        var $target = createTarget(),
                            d3target = d3.select($target.get(0));
                        
                        // Add chart to target
                        
                        // use select.state && select.years
                        
                    }); 
                    break;
                    
            }
            console.log("show comparison", type, v);
            
            
            
            $contEl.css("margin-left", selected.length * min / 2 + "px");
            
            
        },
        clickHandler = function(e, map, group, years) {
            var new_select = {
                    state: group,
                    years: years,
                    map: map
                },
                new_selected = $.grep(selected, function (select) {
                    return !selectedEquals(select, new_select);
                }),
                statecode = group.key.toUpperCase(),
                d3this = d3.select(this);
            
            // unselected
            if (selected.length !== new_selected.length) {
                selected = new_selected;
                // remove pie
                d3this.attr("selected", "");
                
            }
            // selected
            else {
                selected.push(new_select);                                
                
                // add pie
                d3this.style("fill", "mediumseagreen");
                d3this.attr("selected", "selected");
                // TODO: selector for variable and new targets divs with text above pie
//                                makePie(new_select.state, new_select.years, "education", d3.select("body"));
//                                makeParallelSets(new_select.state, [], [], ["jazz", "education", "income", "gender"], d3.select("body"));

            }
            render();
        },
        selectedEquals = function (s1, s2) {
            return (s1.state.key == s2.state.key &&
                        $(s1.years).not(s2.years).length == 0 && 
                        $(s2.years).not(s1.years).length == 0)
        },
        setMaps = function (maps_in) {
            $.extend(maps, maps_in);
            
            $.map(maps, function (map) {
                map.addClickStateFunction(clickHandler);
            });
        };                    
    
    return {
        setMaps: setMaps
    };
};