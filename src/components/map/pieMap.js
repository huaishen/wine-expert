import L from 'leaflet'
import * as d3 from 'd3';
import 'leaflet.markercluster';
import {colorScale} from "../utils/constant";


// var geojson,
//     metadata,
//     geojsonPath = 'traffic_accidents.geojson',
//     categoryField = '5074', //This is the fieldname for marker category (used in the pie and legend)
//     iconField = '5065', //This is the fieldame for marker icon
//     popupFields = ['5065','5055','5074'], //Popup will display these fields
//     tileServer = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//     tileAttribution = 'Map data: <a href="http://openstreetmap.org">OSM</a>',
//     rmax = 30, //Maximum radius for cluster pies
//     markerclusters = L.markerClusterGroup({
//         maxClusterRadius: 2*rmax,
//         iconCreateFunction: defineClusterIcon //this is where the magic happens
//     }),
//     map = L.map('map').setView([59.95, 10.78], 8);
//
// //Add basemap
// L.tileLayer(tileServer, {attribution: tileAttribution,  maxZoom: 15}).addTo(map);
// //and the empty markercluster layer
// map.addLayer(markerclusters);
//
// //Ready to go, load the geojson
// export function pieMap(geojsonPath) {
//     d3.json(geojsonPath, function (error, data) {
//         if (!error) {
//             console.log(data)
//             geojson = data;
//             metadata = data.properties;
//             var markers = L.geoJson(geojson, {
//                 pointToLayer: defineFeature,
//                 onEachFeature: defineFeaturePopup
//             });
//             markerclusters.addLayer(markers);
//             map.fitBounds(markers.getBounds());
//             map.attributionControl.addAttribution(metadata.attribution);
//             renderLegend();
//         } else {
//             console.log('Could not load data...');
//         }
//     });
// }
//
// function defineFeature(feature, latlng) {
//     var myIcon = {
//         iconSize: [12, 12]
//     };
//     return L.marker(latlng, {iconUrl: '../image/wine.svg', iconSize: [12, 12]});
// }
//
// function defineFeaturePopup(feature, layer) {
//     var props = feature.properties,
//         fields = metadata.fields,
//         popupContent = '';
//
//     popupFields.map( function(key) {
//         if (props[key]) {
//             var val = props[key],
//                 label = fields[key].name;
//             if (fields[key].lookup) {
//                 val = fields[key].lookup[val];
//             }
//             popupContent += '<span class="attribute"><span class="label">'+label+':</span> '+val+'</span>';
//         }
//     });
//     popupContent = '<div class="map-popup">'+popupContent+'</div>';
//     layer.bindPopup(popupContent,{offset: L.point(1,-2)});
// }

// function defineClusterIcon(cluster) {
//     var children = cluster.getAllChildMarkers(),
//         n = children.length, //Get number of markers in cluster
//         strokeWidth = 1, //Set clusterpie stroke width
//         r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0), //Calculate clusterpie radius...
//         iconDim = (r+strokeWidth)*2, //...and divIcon dimensions (leaflet really want to know the size)
//         data = d3.group() //Build a dataset for the pie chart
//             .key(function(d) { return d.feature.properties[categoryField]; })
//             .entries(children, d3.map),
//         //bake some svg markup
//         html = bakeThePie({data: data,
//             valueFunc: function(d){return d.values.length;},
//             strokeWidth: 1,
//             outerRadius: r,
//             innerRadius: r-10,
//             pieClass: 'cluster-pie',
//             pieLabel: n,
//             pieLabelClass: 'marker-cluster-pie-label',
//             pathClassFunc: function(d){return "category-"+d.data.key;},
//             pathTitleFunc: function(d){return metadata.fields[categoryField].lookup[d.data.key]+' ('+d.data.values.length+' accident'+(d.data.values.length!=1?'s':'')+')';}
//         }),
//         //Create a new divIcon and assign the svg markup to the html property
//         myIcon = new L.DivIcon({
//             html: html,
//             className: 'marker-cluster',
//             iconSize: new L.Point(iconDim, iconDim)
//         });
//     return myIcon;
// }

/*function that generates a svg markup for the pie chart*/
export function bakeThePie(options) {
    /*data and valueFunc are required*/
    if (!options.data || !options.valueFunc) {
        return '';
    }
    var data = options.data,
        valueFunc = options.valueFunc,
        r = options.outerRadius ? options.outerRadius : 28, //Default outer radius = 28px
        rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
        strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
        pathClassFunc = options.pathClassFunc ? options.pathClassFunc : function () {
            return '';
        }, //Class for each path
        pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function () {
            return '';
        }, //Title for each path
        pieClass = options.pieClass ? options.pieClass : 'marker-cluster-pie', //Class for the whole pie
        pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
        pieLabelClass = options.pieLabelClass ? options.pieLabelClass : 'marker-cluster-pie-label',//Class for the pie label
        origo = (r + strokeWidth), //Center coordinate
        w = origo * 2, //width and height of the svg element
        h = w
    // donut = d3.pie(),
    // arc = d3.arc().innerRadius(rInner).outerRadius(r);

    var pieData = [];
    if (options.group !== 0) {
        var pieMap = {};
        for (const [key, value] of data.entries()) {
            const type_count = value[0].feature.properties.type_count;
            type_count.forEach(d => {
                const name = d.name;
                if (name in pieMap) pieMap[name]['value'] += d.value;
                else pieMap[name] = {"name": name, "value": d.value};
            })
        }
        for (const v in pieMap) {
            pieData.push(pieMap[v]);
        }
    } else {
        pieData = data.properties.type_count
    }

    //Create an svg element
    var svg = document.createElementNS(d3.namespace.svg, 'svg');
    //Create the pie chart
    var vis = d3.select(svg)
        .data([data])
        .attr('class', pieClass)
        .attr('width', w)
        .attr('height', h);

    const arcGenerator = d3
        .arc()
        .innerRadius(rInner)
        .outerRadius(r);

    const pieGenerator = d3
        .pie()
        .padAngle(0)
        .value((d) => d.value);

    const g = vis
        .append('g')
        .attr('transform', `translate(${origo}, ${origo})`);

    const pieArc = g
        .selectAll()
        .data(pieGenerator(pieData))
        .enter();

    const slices = pieArc.append('path')
        .attr('d', arcGenerator)
        .attr('fill', (i, _) => colorScale[i.data.name])
        .attr('stroke-width', 1)


    vis.append('text')
        .attr('x', origo)
        .attr('y', origo)
        .attr('class', pieLabelClass)
        .attr('text-anchor', 'middle')
        //.attr('dominant-baseline', 'central')
        /*IE doesn't seem to support dominant-baseline, but setting dy to .3em does the trick*/
        .attr('font-weight', 300 + 500 * Math.min(Math.max(0, pieLabel / 4000), 1))
        .attr('dy', '.3em')
        .text(pieLabel);
    //Return the svg-markup rather than the actual element
    return serializeXmlNode(svg);
}


// /*Helper function*/
function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
        return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
        return xmlNode.xml;
    }
    return "";
}
