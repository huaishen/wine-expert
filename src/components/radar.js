import React from "react";
import * as d3 from 'd3';
import { styleRadar } from "./styleRadar"
import { CompareRadar } from './comparisonRadar'
import Grid from "@material-ui/core/Grid";
import dataset from '../data/vivino_wines.csv'
import '../css/radar.css'

var margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

//////////////////////////////////////////////////////////////
//////////////////// Draw the Chart //////////////////////////
//////////////////////////////////////////////////////////////


var labels = ['rating', 'price', 'sweetness', 'intensity', 'tannin', 'acidity']


var color = d3.scaleOrdinal().range(['#b11226'])
// console.log(color)
var color2 = d3.scaleOrdinal().range(d3.schemeCategory10)

var radarChartOptions = {
    w: width,
    h: height,
    margin: margin,
    maxValue: 0.5,
    levels: 1,
    roundStrokes: true,
    color: color,
    labels: labels
};

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


export default class StyleRadar extends React.Component {
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        d3.csv(dataset)
            .then((dataset) => {
                let count = key => dataset.filter(d => d.style_varietal_name === key).length
                // console.log(count('Red'))
                var key_list = dataset
                    .map(d => d.style_varietal_name)
                    .filter(d => d)
                    .filter((d,i,self) => (self.indexOf(d) === i))
                    .filter(d => count(d) >= 100)
                // key_list = Array.from(new Set(key_list))

                var select = d3.select('#select')
                    .attr('class','select')
                    .on('change', e => {
                        console.log(d3.select('select').property('value'))
                        key_filter(d3.select('select').property('value'))
                    })
                var options = select
                    .selectAll('option')
                    .data(key_list).enter()
                    .append('option')
                    .text(function (d) {return d;});


                let new_data = []
                const parseF = str => (str ? parseFloat(str) : 0)
                const parseS = str => (str ? str : 'Unknown')



                // filter entry with empty value
                let key=['style_varietal_name', 'White']
                const sum = (a, b) => a+b
                const valid = d => (labels.map(l => (d[l] ? 1 : 0)).reduce(sum, 0) >= labels.length)



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



                d3.select("#addEntry").on('click', function() {
                    if (new_data.length < 6) {
                        let i = Math.floor(Math.random() * dataset.length)
                        let d = dataset[i]
                        // console.log(d)
                        new_data.push(labels.map(l => {
                            let lowbound = 0, upbound = 1.1
                            let value = scales[l](parseF(d[l]))
                            value = Math.min(Math.max(value, lowbound), upbound)
                            return {axis:l, value:value, actValue:parseS(d[l])}
                        }))
                        CompareRadar(".compareRadar", new_data, radarChartOptions2, new_data);
                    }
                    return new_data
                })

                d3.select("#removeEntry").on('click', function() {
                    let i = new_data.length-1
                    new_data.splice(i, 1)
                    CompareRadar(".compareRadar", new_data, radarChartOptions2, new_data);
                    return new_data
                })

                CompareRadar(".compareRadar", new_data, radarChartOptions2, new_data);

                function key_filter(key) {
                    d3.select('#count').text(`Count: ${count(key)}`)

                    let new_data = []
                    let filtered = dataset
                    // .filter(d => valid(d))
                        .filter(d => (d['style_varietal_name'] === key))

                    filtered.forEach((d,i) => {
                        new_data.push(labels.map(l => {
                            let lowbound = 0, upbound = 1.1
                            let value = scales[l](parseF(d[l]))
                            value = Math.min(Math.max(value, lowbound), upbound)
                            return {axis:l, value:value, actValue:parseS(d[l])}
                        }))
                    })
                    styleRadar(".radarChart", new_data, radarChartOptions);
                }
                key_filter('Red')


            })
    }

    render() {
        return (
            <div id="radarContainer">
                <Grid container spacing={3}>
                    <Grid className="centerContainer" item xs>
                        <h1>Comparison Radar</h1>
                        <div>
                            <button id='addEntry'>Add Entry</button>
                            <button id='removeEntry'>Remove Entry</button>
                        </div>
                        <div className="compareRadar"></div>
                    </Grid>

                    <Grid className="centerContainer" item xs>
                        <h1>Style Type Radar</h1>
                        <div>
                            <select id='select'></select>
                            <p id='count'></p>
                        </div>
                        <div className="radarChart"></div>
                    </Grid>
                </Grid>


            </div>

        )

    }
}
