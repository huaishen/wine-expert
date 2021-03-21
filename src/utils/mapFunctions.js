import L from "leaflet";
import {makeStyles} from "@material-ui/core";
import React from "react";
import Slide from "@material-ui/core/Slide/Slide";

export const colorMap = ['#fee2ed', '#920036', '#860535', '#7e0d37', '#751639', '#64273e', '#590829', '#480027', '#380024']

export const countMap = [100, 500, 1000, 3000, 5000, 10000, 20000, 30000, 40000];

export function getColor(d) {
    if (d) {
        for (let i = 0; i < countMap.length; i++) {
            if (d <= countMap[i]) return colorMap[i];
        }
    } else {
        return '#D3D3D3'
    }
}

export function mapStyle(feature) {
    return {
        fillColor: getColor(feature.properties.wine_count),
        weight: 1,
        opacity: 0.4,
        color: 'black',
        fillOpacity: 0.8
    }
}

export function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: 'black',
        fillOpacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}


