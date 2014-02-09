var loading = loading || (function ($, d3, undefined) {
    
    var width = 960,
            height = 500,
            twoPi = 2 * Math.PI,
            progress = 0,
            total = 0, // must be hard-coded if server doesn't report Content-Length
            formatPercent = d3.format(".0%");
    
    var arc, svg, meter, foreground, text, grey,
        init_dfd = $.Deferred();
    
    function init() {        
        arc = d3.svg.arc()
            .startAngle(0)
            .innerRadius(180)
            .outerRadius(240);
         
        svg = d3.select("body").append("svg")
            .classed("progress-container", true)
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
         
        meter = svg.append("g")
            .attr("class", "progress-meter");
         
        meter.append("path")
            .attr("class", "background")
            .attr("d", arc.endAngle(twoPi));
         
        foreground = meter.append("path")
            .attr("class", "foreground");
         
        text = meter.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em");
        
        init_dfd.resolve();
    }
    
    function update (loaded) {
        init_dfd.done(function () {
            var i = d3.interpolate(progress, loaded / total);
            d3.transition().tween("progress", function() {
                return function(t) {
                  progress = i(t);
                  foreground.attr("d", arc.endAngle(twoPi * progress));
                  text.text(formatPercent(progress));
                };
            });
        });
    }
    
    $(function () {
        init();
    });
    
    return {
        startFor: function (size) {
            init_dfd.done(function () {
                $(svg.node()).parent().show();
                total = size;
                grey = $("<div \>")
                    .addClass("modal-backdrop fade")
                    .appendTo("body")
                    .addClass("in");
                update(0);
            });
        },
        update: update,
        hide: function () {
            init_dfd.done(function () {
                meter.transition().delay(250).attr("transform", "scale(0)");
                grey.removeClass("in").addClass("out").delay(200).remove();
                $(svg.node()).parent().hide();
            });
        }
    };
}(jQuery, d3));