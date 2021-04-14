import * as d3 from 'd3'
import '../../css/tree.css'
import { CompareRadar } from '../radar/comparisonRadar.js'

export default function drawRadialChart(id, csvpath, radar_csv, text){
    d3.csv(csvpath).then((Treedata) => {
        d3.csv(radar_csv).then((dataset) => {

    var DURATION = 100; // d3 animation duration
    var STAGGERN = 4; // delay for each node
    var STAGGERD = 200; // delay for each depth
    var NODE_DIAMETER = 4; // diameter of circular nodes
    var MIN_ZOOM = 0.5; // minimum zoom allowed
    var MAX_ZOOM = 10;  // maximum zoom allowed
    var HAS_CHILDREN_COLOR = 'lightsteelblue';
    var SELECTED_COLOR = '#a00';  // color of selected node
    var ZOOM_INC = 0.04;  // zoom factor per animation frame
    var PAN_INC = 3;  //  pan per animation frame
    var ROT_INC = 0.3;  // rotation per animation frame

    var counter = 0;  // node ids
    var curNode;  // currently selected node
    var curPath;  // array of nodes in the path to the currently selected node
    var flag = 0;
    // size of the diagram
    var width = 500;
    var height = 500;

    // current pan, zoom, and rotation
    var curX = width / 2;
    var curY = height / 2;
    var curZ = 1.0; // current zoom
    var curR = 270; // current rotation

// d3 diagonal projection for use by the node paths
    // var diagonal= d3.svg.diagonal.radial()
    //   .projection(function(d) {
    //       return [d.y, d.x / 180 * Math.PI];
    //   });

    function project(x, y) {
      // return [y, x / 180 * Math.PI];
      var angle = (x - 90) / 180 * Math.PI, radius = y;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }

    // d3 tree layout
    var tree = d3.tree()
      // .nodeSize([4.5, 120])
      .size([360, Math.min(width, height) / 2 - 120])
      .separation(function(a, b) {
        return a.depth === 0 ? 1 : (a.parent === b.parent ? 1 : 2) / a.depth;
    });

    // define the svgBase, attaching a class for styling and the zoomListener
    d3.select(id).select("svg").remove();
    var svgBase = d3.select('.drawRadialChart').append('svg')
      .attr('width', width)
      .attr('height', height)
      // .on('mousedown', mousedown);

    // Group which holds all nodes and manages pan, zoom, rotate
    var svgGroup = svgBase.append('g')
      .attr('transform', 'translate(' + curX + ',' + curY + ')');

    d3.select('#selection').on('mousedown', switchroot);

    // Define the data root
    var stratify = d3.stratify()
      .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("\\")); });

    var root = stratify(Treedata)
    // console.log(root)

    // var root = d3.hierarchy(Treedata);
    root.x0 = curY;
    root.y0 = 0;
    selectNode(root); // current selected node

    // Collapse all children of root's children before rendering
    // var text = "South African Syrah"
    var source = root;
    for(var i=0;i<6;i++){
          for(var c in root.children[i].children){
             var children_id = root.children[i].children[c].id
             if(children_id.substring(children_id.lastIndexOf("\\") + 1) == text){
               source = root.children[i].children[c]
               break
             }
          }
    }

    update(source);
    update(source);
    // switchroot(source);
    // update(root); // Layout the tree initially and center on the root node
    // update the tree
    // source - source node of the update
    // transition - whether to do a transition

    function update(source, transition) {
        selectNode(source);
        if(source == root){
          if (root.children) {
            root.children.forEach(function(child) {
                collapseTree(child);
            });
          }
        }
        // console.log(flag)
        // var duration = transition ?
        //   (event && event.altKey ? DURATION * 4 : DURATION) : 0;
        var duration = 2

        // Compute the new tree layout.

        var nodes = tree(source).descendants();
        var links = tree(source).links();
        svgGroup.transition().duration(duration)
        .attr('transform',
          'rotate(' + curR + ' ' + curX + ' ' + curY +
          ')translate(' + curX + ' ' + curY +
          ')scale(' + curZ + ')');

      // Update the nodes…
      var node = svgGroup.selectAll('g.node')
        .data(nodes, function(d) {
          return d.id || (d.id = ++counter);
        });

        function wrap(text, width) {
          text.each(function() {

            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat('.35em')/2,
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                // console.log(words, y, text.attr("dy"))
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join("  "));
              if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join("  "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
              }
            }
          });
        }

      // Enter any new nodes at the parent's previous position
      var nodeEnter = node.enter().insert('g', ':first-child')
          .attr('class', 'node')
          // .attr('transform', 'rotate(' + (source.x0 - 90) + ')translate(' + source.y0 + ')')
          .on('click', click)
          .on('dblclick', dblclick)
          // .on('mousedown', suppress);

      nodeEnter.append('circle')
        .attr('r', 1e-6)
        .style('fill', function(d) {
          return d._children ? HAS_CHILDREN_COLOR : 'white';
        });

      nodeEnter.append('text')
        // .text(function(d) {  if(d.name.length > 10) { return wordwrap(d.name, 10, '<br>') } } )
        .text(function(d) {
          return d.id.substring(d.id.lastIndexOf("\\") + 1);
          // return d.data.name;
        })
        .style('opacity', 0.9)
        .style('fill-opacity', 0)
        .attr('transform', function() {
            return ((source.x0 + curR) % 360 <= 180 ?
                'translate(8)scale(' :
                'rotate(180)translate(-8)scale('
              ) + reduceZ() + ')';
        });

      // update existing graph nodes

      // Change the circle fill depending on whether it has children and is collapsed
      node.select('circle')
        .attr('r', NODE_DIAMETER * reduceZ())
        .style('fill', function(d) {
            return d._children ? HAS_CHILDREN_COLOR : 'white';
        }).attr('stroke', function(d) {
            return d.selected ? SELECTED_COLOR : 'steelblue';
        }).attr('stroke-width', function(d) {
            return d.selected ? 3 : 1.5;
        });

      node.select('text')
        .attr('text-anchor', function(d) {
            return (d.x + curR) % 360 <= 180 ? 'start' : 'end';
        }).attr('transform', function(d) {
            return ((d.x + curR) % 360 <= 180 ?
                'translate(8)scale(' :
                'rotate(180)translate(-8)scale('
              ) + reduceZ() +')';
        }).attr('fill', function(d) {
            return d.selected ? SELECTED_COLOR : 'black';
        }).attr('dy', '.35em');

      var nodeUpdate = node.merge(nodeEnter).transition().duration(duration)
        .delay( transition ? function(d, i) {
            return i * STAGGERN +
              Math.abs(d.depth - curNode.depth) * STAGGERD; }  : 0)
        .attr('transform', function(d) {
            return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
        });

      nodeUpdate.select('circle')
        .attr('r', NODE_DIAMETER * reduceZ());
        // .style('fill', function(d) {
        //   return d._children ? HAS_CHILDREN_COLOR : 'white';
        // });

      nodeUpdate.select('text')
        .style('fill-opacity', 1);
      nodeUpdate.select("text").call(wrap, 90);

      // Transition exiting nodes to the parent's new position and remove
      var nodeExit = node.exit().transition().duration(duration)
        .delay( transition ? function(d, i) {
            return i * STAGGERN; } : 0)
        .attr('transform', function() {
          return 'rotate(' + (source.x - 90) +')translate(' + source.y + ')';
      }).remove();

      nodeExit.select('circle').attr('r', 0);
      nodeExit.select('text').style('fill-opacity', 0);

        // Update the links...
        var link = svgGroup.selectAll('path.link')
            .data(links, function(d) {
              return d.target.id;
            });

// Enter any new links at the parent's previous position
    link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr("d", function(d) {
                  return "M" + project(d.target.x, d.target.y)
                      + "C" + project(d.target.x, (d.target.y + d.source.y) / 2)
                      + " " + project(d.source.x, (d.target.y + d.source.y) / 2)
                      + " " + project(d.source.x, d.source.y);
                })

    // Transition links to their new position
    link.transition().duration(duration)
      .delay( transition ? function(d, i) {
          return i * STAGGERN +
            Math.abs(d.source.depth - curNode.depth) * STAGGERD;
            // Math.max(0, d.source.depth - curNode.depth) * STAGGERD;
          } : 0)
          .attr("d", function(d) {
            return "M" + project(d.target.x, d.target.y)
                + "C" + project(d.target.x, (d.target.y + d.source.y) / 2)
                + " " + project(d.source.x, (d.target.y + d.source.y) / 2)
                + " " + project(d.source.x, d.source.y);
          })

    // Transition exiting nodes to the parent's new position
    link.exit().transition().duration(duration)
    .attr("d", function(d) {
      return "M" + project(d.target.x, d.target.y)
          + "C" + project(d.target.x, (d.target.y + d.source.y) / 2)
          + " " + project(d.source.x, (d.target.y + d.source.y) / 2)
          + " " + project(d.source.x, d.source.y);
    }).remove();

        // Stash the old positions for transition
        nodes.forEach(function(d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      } // end update

    // Helper functions for collapsing and expanding nodes

    // Toggle expand / collapse
    // function toggle(d) {
    //   console.log(d.children, d._children)
    //   if (d.children) {
    //     d._children = d.children;
    //     d.children = null;
    //   } else if (d._children) {
    //     d.children = d._children;
    //     d._children = null;
    //   }
    // }


    function toggleTree(d) {
      if (d.children) {
        collapseTree(d);
      } else {
        expandTree(d);
      }
    }

    function expand(d) {
      if (d._children) {
        d.children = d._children;
        d._children = null;
      }
    }

    // expand all children, whether expanded or collapsed
    function expandTree(d) {
      if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      if (d.children) {
        d.children.forEach(expandTree);
      }
    }

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      }
    }

  //   // collapse all children
    function collapseTree(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      }
      if (d._children) {
        d._children.forEach(collapseTree);
      }
    }

  //   // expand one level of tree
    function expand1Level(d) {
      var q = [d]; // non-recursive
      var cn;
      var done = null;
      while (q.length > 0) {
        cn = q.shift();
        if (done !== null && done < cn.depth) { return; }
        if (cn._children) {
          done = cn.depth;
          cn.children = cn._children;
          cn._children = null;
          cn.children.forEach(collapse);
        }
        if (cn.children) { q = q.concat(cn.children); }
      }
      // no nodes to open
    }

  //   // highlight selected node
    function selectNode(node) {
      if (curNode) {
        delete curNode.selected;
      }
      curNode = node;
      curNode.selected = true;
      curPath = []; // filled in by fullpath
      // console.log("curnode", curNode)
      d3.select('#selection').html(fullpath(node));
    }

  //   // for displaying full path of node in tree
    function fullpath(d, idx) {
      idx = idx || 0;
      curPath.push(d);
      return (
        d.parent ? fullpath(d.parent, curPath.length) : '') +
        '/<span class="nodepath'+(d.data.name === root.data.name ? ' highlight' : '')+
        '" data-sel="'+ idx +'" title="Set Root to '+ d.data.name +'">' +
        d.name + '</span>';
    }

  //   // d3 event handlers

    function switchroot(event) {
      event.preventDefault();
      var pathelms = document.querySelectorAll('#selection .nodepath');
      for (var i = 0; i < pathelms.length; i++) {
        pathelms[i].classList.remove('highlight');
      }
      var target = event.target;
      var node = curPath[+target.dataset.sel];
      if (event.shiftKey) {
        if (curNode !== node) {
          selectNode(node);
        }
      } else {
        root = node;
        target.classList.add('highlight');
      }
      update(root, true);
    }

    // function click(event, d) { // select node
    //   console.log("click", d)
    //   if (event.defaultPrevented || d === curNode) { return; } // suppressed
    //   event.preventDefault();
    //   selectNode(d);
    //   update(d, true);
    // //   update(d, true);
    // }

    function dblclick(event, d) {  // Toggle children of node
      if (event.defaultPrevented) { return; } // click suppressed
      event.preventDefault();
      // if (event.shiftKey) {
      //   console.log("shift")
      //   expand1Level(d); // expand node by one level
      // } else {
      //   console.log("trigger")
      //   toggle(d);
      // }
      // toggle(d);
      // expand1Level(d);
      if(flag === 0){
        flag = 1;
        update(d, true);
        update(d, true);

      }else{
        flag = 0;
        update(root, true);
        update(root, true);

      }

      // update(d, true);
    }

    var startposX, startposY; // initial position on mouse button down for pan


    // keep rotation between 0 and 360
    function limitR(r) {
      return (r + 360) % 360;
    }

  //   // limit size of text and nodes as scale increases
    function reduceZ() {
      return Math.pow(1.1, -curZ);
    }

  //   // set view with no animation
    function setview() {
        svgGroup.attr('transform', 'rotate(' + curR + ' ' + curX + ' ' + curY +
            ')translate(' + curX + ' ' + curY + ')scale(' + curZ + ')');
        svgGroup.selectAll('text')
            .attr('text-anchor', function(d) {
                return (d.x + curR) % 360 <= 180 ? 'start' : 'end';
            })
            .attr('transform', function(d) {
                return ((d.x + curR) % 360 <= 180 ?
                    'translate(8)scale(' :
                    'rotate(180)translate(-8)scale('
                  ) + reduceZ() +')';
            });
        svgGroup.selectAll('circle').attr('r', NODE_DIAMETER * reduceZ());
    }

    var color2 = d3.scaleOrdinal().range(d3.schemeCategory10)
    var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = 200
    height = 200;
    var labels = ['rating', 'price', 'sweetness', 'intensity', 'tannin', 'acidity']

    var radarChartOptions2 = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0.5,
        levels: 1,
        roundStrokes: true,
        color: color2,
        labels: labels
    };




        let new_data = []
        const parseF = str => (str ? parseFloat(str) : 0)
        const parseS = str => (str ? str : 'Unknown')

        // build scales
        let range = 0.03
        let scales = {}
        labels.map(l => {
            let sorted = dataset.map(d => d[l])
                .filter(v => v)
                .sort((a, b) => a-b)

            scales[l] = d3.scaleLinear()
            // .domain([d3.min(dataset, (d) => parseF(d[l])),
            // 		d3.max(dataset, (d) => parseF(d[l]))])
                .domain([d3.min(dataset, (d) => parseF(sorted[Math.floor(sorted.length*range)])),
                    d3.max(dataset, (d) => parseF(sorted[Math.floor(sorted.length*(1-range))]))])
                .range([0.1, 1])
        })



        function click(event, d){
            var name = d.id.substring(d.id.lastIndexOf("\\") + 1);
            if(d.children){
                return;
            }
            // console.log(dataset[0]['name'])
            var target;
            for(var i in dataset){
                if(dataset[i]['name'] == name){
                    target = i;
                    break;
                }
            }
            // console.log(target)
            if (new_data.length < 6) {
                let d = dataset[target]
                // console.log(d)
                new_data.push(labels.map(l => {
                    let lowbound = 0, upbound = 1.1
                    let value = scales[l](parseF(d[l]))
                    value = Math.min(Math.max(value, lowbound), upbound)
                    return {axis:l, value:value, actValue:parseS(d[l])}
                }))
                CompareRadar(".radarChart", new_data, radarChartOptions2, new_data);
            }
            return new_data
        }

                // CompareRadar(".compareRadar", new_data, radarChartOptions2, new_data);


            })


  });


}
