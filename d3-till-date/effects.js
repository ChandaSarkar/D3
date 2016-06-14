var monitorResults = [];
var monitorObjects = {
    "APIGEE PROXY": [],
    "ULTRA DNS": [],
    "F5": [],
    "DMZ": [],
    "MINI V1": [],
    "Couch DB": [],
    "MMDB": [],
    "SQL Servers": [],
    "IUSA Match": [],
    "AWS DNS": [],
    "ELB": [],
    "PRIVATE CLOUD": [],
    "ELB MINI": [],
    "MINI V2": []
};

// This method will parse JSON response of monitor list to acceptable format
var setMonitor = function(monitorData) {
    var monitor;
    for (var index = 0; index < monitorData.length; ++index) {
        monitor = monitorData[index];
        var key = '';
        if (monitor.name.indexOf("Prod - AP") > -1) {
            key = "APIGEE PROXY";
        } else if (monitor.name.indexOf("UltraDNS") > -1) {
            key = "ULTRA DNS";
        } else if (monitor.name.indexOf("Prod - F5") > -1) {
            key = "F5";
        } else if (monitor.name.indexOf("Prod - Match - ") > -1 || monitor.name.indexOf("Prod - Website") > -1) {
            key = "DMZ";
        } else if (monitor.name.indexOf("Prod - Mini") > -1) {
            key = "MINI V1";
        } else if (monitor.name.indexOf("Prod - CouchDB") > -1) {
            key = "Couch DB";
        } else if (monitor.name.indexOf("Prod - SQL") > -1) {
            key = "MMDB";
        } else if (monitor.name.indexOf("Prod - MMDB") > -1) {
            key = "SQL Servers";
        } else if (monitor.name.indexOf("Prod - IUSA") > -1) {
            key = "IUSA Match";
        } else if (monitor.name.indexOf("AWS-DNS") > -1) {
            key = "AWS DNS";
        } else if (monitor.name.indexOf("Prod v2 - ELB") > -1) {
            key = "ELB";
        } else if (monitor.name.indexOf("Prod v2 - Match Private") > -1) {
            key = "PRIVATE CLOUD";
        } else if (monitor.name.indexOf("Prod v2 - Mini ELB") > -1) {
            key = "ELB MINI";
        } else if (monitor.name.indexOf("Prod v2 - Mini Private") > -1) {
            key = "MINI V2";
        }

        if (key) {
            //if ("F5" === key) {
            //    monitor.status = 0;
            //}
            monitorObjects[key].push(monitor);
        }
    }
};

// This method will read JSON response to render tree
var renderTreeList = function() {
    var margin = {top: 20, right: 120, bottom: 20, left: 120};
    var width = 900 - margin.right - margin.left;
    var height = 500 - margin.top - margin.bottom;

    var i = 0;
    var duration = 750;
    var root;

    var tree = d3.layout.tree().size([height, width]);

    var diagonal = d3.svg.diagonal().projection(function(d) {
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

    d3.json("Test.json", function(error, flare) {
        if (error)
            throw error;

        root = flare;
        root.x0 = height / 2;
        root.y0 = 0;

        var collapse = function(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        };

        root.children.forEach(collapse);
        update(root);
    });

    d3.select(self.frameElement).style("height", "800px");

    var update = function(source) {
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

        // Update the links
        var link = svg.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                });

        // Enter any new links at the parent's previous position
        link.enter().insert("path", "g")
                //.attr("class", "link")
                .attr("class", function(d) {
                    var monitorList = monitorObjects[d.target.name];
                    var monitorLinkClass = "link";
                    if (monitorList) {
                        for (var index = 0; index < monitorList.length; ++index) {
                            var monitor = monitorList[index];
                            if (monitor.status === 0) {
                                // Monitor status is down
                                monitorLinkClass = "link module-down";
                                break;
                            } else if (monitor.status !== 1) {
                                // Monitor status is not as expected
                                monitorLinkClass = "link module-unrechable";
                                break;
                            }
                        }
                    }
                    return monitorLinkClass;
                })
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
    };

    // Toggle children on click.
    var click = function(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    };

    // This method will be called on mouseout of node
    var fadeNode = function(monitor) {
        tooltipDiv.transition().duration(500).style("opacity", 0);
    };

    // This method will display tooltip displaying server list on mouseover
    var hoverNode = function(monitor) {
        tooltipDiv.transition().duration(200).style("opacity", .9);

        var monitorList = monitorObjects[monitor.name];

        // Validating if it an empty node
        if (!monitorList) {
            return;
        }

        var filteredResult = monitorList.filter(function(currentMonitor) {
            return currentMonitor;
        });

        var str = String(filteredResult.map(function(currentMonitor) {
            var markUp = "";
            if (currentMonitor.status === 1) {
                markUp = "<img src='up_arrow.png'></a><span>";
            } else {
                markUp = "<img src='down_arrow.png'></a><span>";
            }
            markUp = markUp + currentMonitor.name + "</span>" + "<BR>";
            return markUp;
        }));

        str = str.replace(/,/g, "");

        tooltipDiv.html(str)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
    };
};

// Making ajax call to get list of all monitors
$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'https://www.site24x7.com/api/current_status',
        data: {authtoken: 'e16708698d4af2036ffc04a8b55446f5', group_required: false},
        dataType: 'jsonp',
        success: function(result) {
            // Remdering monitors as per its server type
            var monitor = result.body.data.monitors;
            setMonitor(monitor);
            renderTreeList();
        }
    });
});