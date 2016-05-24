var monitorResults = [];

$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'https://www.site24x7.com/api/current_status',
        data: {authtoken: 'e16708698d4af2036ffc04a8b55446f5', group_required: false},
        dataType: 'jsonp',
        success: function(result) {
            //console.log(result);  
            monitors = result.body.data.monitors;
            for (var id = 0; id < monitors.length; id++) {
                monitorResults.push({"id": monitors[id].monitor_id,
                    "name": monitors[id].name,
                    "type": monitors[id].monitor_type,
                    "status": monitors[id].status,
                    "category": getCategory(monitors[id].name)});
            }
            //renderStateDiv(monitorResults, pingCount, urlCount, portCount, restCount);
            renderTreeList(monitorResults);

        }
    });

    function getCategory(name) {

        if (name.indexOf("Prod - AP") > -1)
            return "Prod - AP";
        else if (name.indexOf("UltraDNS") > -1)
            return "UltraDNS";
        else if (name.indexOf("AWS-DNS") > -1)
            return "AWS-DNS";
        else if (name.indexOf("F5") > -1)
            return "F5";
        else if (name.indexOf("Prod - Match") > -1)
            return "DMZ";
        else if (name.indexOf("SQL") > -1)
            return "SQL";
        else if (name.indexOf("MMDB") > -1)
            return "MMDB";
        else if (name.indexOf("Prod - IUSA") > -1)
            return "IUSA";
        else if (name.indexOf("Prod - Mini") > -1)
            return "MINI";
        else if (name.indexOf("CouchDB") > -1)
            return "CouchDB";


    }



    function renderTreeList(monitorResults) {

        var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 900 - margin.right - margin.left,
                height = 500 - margin.top - margin.bottom;

        var i = 0,
                duration = 750,
                root;

        var tree = d3.layout.tree()
                .size([height, width]);

        var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.y, d.x];
                });

        var svg = d3.select("#monitorTree").append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var tooltipDiv = d3.select("#monitorTree").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

        d3.json("Monitors.json", function(error, flare) {
            if (error)
                throw error;

            root = flare;
            root.x0 = height / 2;
            root.y0 = 0;

            function collapse(d) {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(collapse);
                    d.children = null;
                }
            }

            root.children.forEach(collapse);
            update(root);
        });

        d3.select(self.frameElement).style("height", "800px");



        function update(source) {

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);

            // Normalize for fixed-depth.
            nodes.forEach(function(d) {
                d.y = d.depth * 100;
            });

            // Update the nodes…
            var node = svg.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id || (d.id = ++i);
                    });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })
                    .on("click", click)
                    .on("mouseover", hoverNode)
                    .on("mouseout", fadeNode);


            nodeEnter.append("circle")
                    .attr("r", 1e-6)
                    .style("fill", function(d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });

            nodeEnter.append("text")
                    .attr("x", function(d) {
                        return d.children || d._children ? -10 : 10;
                    })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function(d) {
                        return d.children || d._children ? "end" : "start";
                    })
                    .text(function(d) {
                        return d.name;
                    })
                    .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

            nodeUpdate.select("circle")
                    .attr("r", 4.5)
                    .style("fill", function(d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });

            nodeUpdate.select("text")
                    .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

            nodeExit.select("circle")
                    .attr("r", 1e-6);

            nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll("path.link")
                    .data(links, function(d) {
                        return d.target.id;
                    });

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d) {
                        var o = {x: source.x0, y: source.y0};
                        return diagonal({source: o, target: o});
                    });

            // Transition links to their new position.
            link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                    .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }
        function fadeNode(d) {
            tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0);
        }
        ;

        function hoverNode(d) {

            tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
            //filter results based on name of the node
            var filteredResult = monitorResults.filter(function(el) {
                if (el.category != null && el.category != "undefined" &&
                        el.category.indexOf(d.name) > -1)
                    return el.name;
            }
            )
            var str = String(filteredResult.map(function(el) {
                return el.name;
            }));

            //var height = if(filteredResult!= null && filteredResult.length>0) 5 else 0;

            tooltipDiv.html("<img height='10px' src='up_arrow.jpg'>"
                    + str.replace(/,/g, "<BR><img height='10px' src='up_arrow.jpg'></a>"))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("height", function(d) {
                        return filteredResult.length * 5;
                    } + "px");

        }



    }
    ;
});