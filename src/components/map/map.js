import React from 'react'
import L from 'leaflet'
import '../../css/map.css'
import 'leaflet/dist/leaflet.css'
import {colorMap, countMap, getColor, highlightFeature, mapStyle} from "../utils/mapFunctions";
import FullScreenDialog from './countryDialog'
import wineIcon from '../../image/wine.svg';
import 'leaflet.markercluster';
import {bakeThePie} from "./pieMap";
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import * as d3 from "d3";

const countries = require('../../data/countries.geo.json');
const wine_data = require('../../data/wine_data.json');
const price_data = require('../../data/wine_price.json');
const geo_data = require('../../data/wine_geo.json');

const wine_geo = JSON.parse(geo_data);

export default class WineMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showDialog: false,
            properties: {admin: ''},
            activeData: [],
            priceData: []
        }
        L.Icon.Default.imagePath = 'images/';
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }

    openDialog(properties) {
        this.setState({
            showDialog: true,
            properties: properties,
            activeData: wine_data.filter(d => d.name === properties.name)[0],
            priceData: price_data.filter(d => d.country_name === properties.name)
        });
    }

    closeDialog() {
        this.setState({showDialog: false})
    }

    componentDidMount() {
        let self = this;

        // Choropleth map layer
        const mymap = L.map('mapid', {zoom: 3, center: [46, 1], maxZoom: 13});
        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            accessToken: 'pk.eyJ1Ijoiampib3k5NiIsImEiOiJja203ZXZkYTgwNjN3MnZtZDJyZWFtdHZtIn0.CF9MEkv7qD15uEJqq499ig',
            maxZoom: 13,
            id: 'mapbox/light-v10',
            minZoom: 3
        }).addTo(mymap);

        var geojson;

        function clickFeature(e) {
            const feature = e.target.feature;
            if (feature.properties.wine_count) self.openDialog(feature.properties)
        }

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: e => geojson.resetStyle(e.target),
                click: clickFeature
            });
            console.log(feature)
            layer.bindTooltip("Country: " + feature.country + '<br/> Wine count: ' + (feature.properties.wine_count? feature.properties.wine_count : 0))
        }

        geojson = L.geoJson(countries, {
            style: mapStyle,
            onEachFeature: onEachFeature
        }).addTo(mymap)

        //    Custom legend control
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            let div = L.DomUtil.create('div', 'info legend'),
                grades = countMap;
            div.innerHTML += '<span style="font-weight: bold"> Number of Wines </span><br>'
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i]) + '"></i> ' +
                    (grades[i - 1] ? grades[i - 1] : '0') + '&ndash;' + grades[i] + '<br>';
            }
            return div;
        };
        legend.addTo(mymap);

        // const choroLayerGroup = L.FeatureGroup([geojson]);

        // PieMap
        const rmax = 27

        // L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        //     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        //     accessToken: 'pk.eyJ1Ijoiampib3k5NiIsImEiOiJja203ZXZkYTgwNjN3MnZtZDJyZWFtdHZtIn0.CF9MEkv7qD15uEJqq499ig',
        //     maxZoom: 15,
        //     id: 'mapbox/light-v10',
        //     minZoom: 6
        // }).addTo(pieMapLayerGroup);

        function defineClusterIcon(cluster) {
            var children = cluster.getAllChildMarkers(),
                n = children.reduce((a, b) => a + b.feature.properties.wine_count, 0), //Get number of markers in cluster
                strokeWidth = 1, //Set clusterpie stroke width
                r = rmax-2*strokeWidth-(n<10?15:n<50?13:n<100?11:n<500?9:n<1000?7:n<2000?5:n<4000?3:n<5000?1:0), //Calculate clusterpie radius...
                iconDim = (r+strokeWidth)*2, //...and divIcon dimensions (leaflet really want to know the size)

                data = d3.group(children, d => d.feature.properties),
                //bake some svg markup
                html = bakeThePie({data: data,
                    valueFunc: function(d){return Math.sum(d.values.forEach(d => d.value[0].feature.properties.winery_count));},
                    strokeWidth: 1,
                    outerRadius: r,
                    innerRadius: r - 4,
                    pieClass: 'cluster-pie',
                    pieLabel: n,
                    pieLabelClass: 'marker-cluster-pie-label',
                    pathClassFunc: function(d){return "category-1";},
                    pathTitleFunc: function(d){return d.feature._leaflet_id;}
                }),
                //Create a new divIcon and assign the svg markup to the html property
                myIcon = new L.DivIcon({
                    html: html,
                    className: 'marker-cluster',
                    iconSize: new L.Point(iconDim, iconDim)
                });
            return myIcon;
        }


        let markerclusters = L.markerClusterGroup({
            maxClusterRadius: 2 * rmax,
            iconCreateFunction: defineClusterIcon //this is where the magic happens
        })

        function defineFeature(feature, latlng) {
            var n = feature.properties.wine_count, //Get number of markers in cluster
                strokeWidth = 1, //Set clusterpie stroke width
                r = rmax-2*strokeWidth-(n<10?15:n<50?13:n<100?11:n<500?9:n<1000?7:n<2000?5:n<4000?3:n<5000?1:0), //Calculate clusterpie radius...
                iconDim = (r+strokeWidth)*2,

                html = bakeThePie({data: feature,
                valueFunc: function(d){return Math.sum(d.values.forEach(d => d.value[0].feature.properties.winery_count));},
                strokeWidth: 1,
                    group: 0,
                outerRadius: r,
                innerRadius: r - 4,
                pieClass: 'cluster-pie',
                pieLabel: n,
                pieLabelClass: 'marker-cluster-pie-label',
                pathClassFunc: function(d){return "category-1";},
                pathTitleFunc: function(d){return d.feature._leaflet_id}
            })

            const myIcon =  new L.DivIcon({
                html: html,
                className: 'marker-cluster',
                iconSize: new L.Point(iconDim, iconDim)
            });
            return L.marker(latlng, {icon: myIcon})
        }

        var markers = L.geoJson(wine_geo, {
            pointToLayer: defineFeature,
            // onEachFeature: defineFeaturePopup
        })

        markerclusters.addLayer(markers)
        // const markercluster = L.markerClusterGroup()
        // markercluster.addLayer(markers).addTo(pieMapLayerGroup)


        // legend.addTo(mymap);
        // L.control.layers({'Choropleth Map': choroLayerGroup, 'Pie Map': pieMapLayerGroup}).addTo(mymap)

        geojson.beforeAdd = map => {
            legend.addTo(map);
        }

        markerclusters.beforeAdd = map => {
            map.removeControl(legend)
        }

        mymap.on('zoomend', (map) => {
            const zoomLevel = mymap.getZoom()
            console.log(zoomLevel)
            if (zoomLevel < 6) {
                if (mymap.hasLayer(markerclusters)) {
                    mymap.removeLayer(markerclusters)
                    geojson.addTo(mymap)
                }
            }
            if (zoomLevel >= 6) {
                if (mymap.hasLayer(geojson)) {
                    mymap.removeLayer(geojson)
                    markerclusters.addTo(mymap)
                }
            }
        })

    }


    render() {
        return (
            <div>
                <div id="mapid"/>
                <FullScreenDialog open={this.state.showDialog} closeDialog={this.closeDialog}
                                  openDialog={this.openDialog} activeData={this.state.activeData}
                                  properties={this.state.properties} priceData={this.state.priceData}/>
            </div>

        )

    }
}
