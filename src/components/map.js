import React from 'react'
import L from 'leaflet'
import '../css/map.css'
import 'leaflet/dist/leaflet.css'
import {colorMap, countMap, getColor, highlightFeature, mapStyle} from "../utils/mapFunctions";
import FullScreenDialog from './countryDialog'

const countries = require('../data/countries.geo.json');
const wine_data = require('../data/wine_data.json');
const price_data = require('../data/wine_price.json');

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

        const mymap = L.map('mapid').setView([1.290270, 103.851959], 3);
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
        }

        geojson = L.geoJson(countries, {
            style: mapStyle,
            onEachFeature: onEachFeature
        }).addTo(mymap);

        //    Custom legend control
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            let div = L.DomUtil.create('div', 'info legend'),
                grades = countMap;
            for (let i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i]) + '"></i> ' +
                    (grades[i - 1] ? grades[i - 1] : '0') + '&ndash;' + grades[i] + '<br>';
            }
            return div;
        };
        legend.addTo(mymap);
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
