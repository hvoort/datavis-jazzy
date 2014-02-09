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
                    .appendTo("body")
                    .addClass("modal-backdrop fade in")
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
                grey.removeClass("in").addClass("out").delay(200).remove();
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
            if (varcard.find("option").length == 0) 
                varcard.find("select").append($.map(comparable, function (c) {
                    return "<option>" + ucfirst(c) + "</option>";
                }).join(""))
            varcard.find("option").first().attr("selected", true);
            
            // reset values and handlers
            choicecard.find("input").each(function () {
                $(this).attr("checked", false);
                $(this).unbind().on("click", function () {
                    // reset values and handlers
                    var sel = varcard.find("select"),
                        go = varcard.find("select"),
                        type = $(this).val();
                    
                    if (type === "ps") sel.attr("multiple", "multiple"); 
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
                        var val = sel.val();
                        if ($.isArray(sel.val())) {
                            val = $.map(val, function (v) { return v.toLowerCase(); });
                        } else {
                            val = val.toLowerCase(); 
                        }
                        close();
                        showComparison(type,  val);
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
                dh = $(document).height() - 50,
                dw = $(document).width() / selected.length - 50,
                minmultiple = Math.min(dw, dh) - 50,
                min = Math.min($(document).width(), $(document).height()) - 50,
                grey = $("<div \>")
                    .addClass("modal-backdrop fade in")
                    .appendTo("body")
                    .on("click", close);
            
            function close() {
                $("#compare_container div.card").each(function () { $(this).remove(); });
                grey.removeClass("in").addClass("out").delay(200).remove();
            }
            
            function createTarget(size) {
                var content = $("<div \>")
                        .addClass("cardcontent"),
                    card = $("<div \>")
                        .addClass("card");
                
                card.css({
                    "opacity": 0,
                    "width": size + "px",
                    "height": size + "px"
                }).appendTo($contEl)
                .append(content)
                .animate({"opacity": 1}, 200);
                return content;
            }
            
            var mergeddata = [];
            var stateslist = [];
            var yearslist = [];
            selected.forEach(function(select) {
                mergeddata.push(select.state);
                stateslist.push(select.state.key);
                yearslist.push(select.years[0]);
            });
            switch (type) {
                case "ps":
                    var $target = createTarget(min),
                        d3target = d3.select($target.get(0));
                    
                    var sel_cults = $.map($("#mapfilters input[type='checkbox']:checked"), function (filter) { return $(filter).val(); });
                    if ($.isArray(v)) $.merge(sel_cults, v);
                    else $.merge(sel_cults, [v]);
                    
                    // TODO goede size kiezen
                    makeParallelSets(mergeddata, stateslist, yearslist, sel_cults, d3target, min - 20, min - 20);
                    
                    $contEl.css("margin-left", -parseInt(min / 2 + 50) + "px");
                    $contEl.css("margin-top", (dh - min) / 2 + "px");
                    break;
                    
                case "bar":
                    var $target = createTarget(min),
                        d3target = d3.select($target.get(0));
                    
                    // TODO goede size kiezen
                    makeBarComparison(mergeddata, stateslist, yearslist, v, d3target, min-20, min-20)
                    
                    $contEl.css("margin-left", -parseInt(min / 2 + 50) + "px");
                    $contEl.css("margin-top", (dh - (min + 50)) / 2 + "px");
                    break;
                case "pie":
                    $.map(selected, function (select, i) {
                        var $target = createTarget(minmultiple),
                            d3target = d3.select($target.get(0));  
                        
                        // TODO goede size kiezen
                        makePie(mergeddata, select.state.key, select.years[0], v, d3target, minmultiple-20, minmultiple-20);  
                    }); 
                    $contEl.css("margin-left", -parseInt(selected.length * (minmultiple + 50) / 2) + "px");
                    $contEl.css("margin-top", (dh - (minmultiple + 50)) / 2 + "px");
                    break;                    
            }            
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