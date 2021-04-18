import React from "react";
import * as d3 from 'd3';
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import dataset from "../../data/wine_name_grapes.csv";
import dataset_tree from "../../data/tree.csv";
import dataset_radar from '../../data/wine_radar.csv'
import { makeStyles } from "@material-ui/styles";
import '../../css/radialTree.css'
import drawGrapeChart from './grape'
import drawRadialChart from './radial'
import {colorScale} from '../utils/constant'
import styleRadar from './radar_style'

var margin = {top: 28, right: 40, bottom: 50, left: 40},
    width = Math.min(275, window.innerWidth - 10) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);


var labels = ['rating', 'price', 'sweetness', 'intensity', 'tannin', 'acidity']
var color = d3.scaleOrdinal().range(['#6a111c'])

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

export default class RadialTree extends React.Component {
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        drawGrapeChart(".drawGrapeChart", dataset)
        drawRadialChart(".drawRadialChart", dataset_tree, dataset_radar, "Wine")

        function drawGrapeChart(id, csvpath){
            d3.csv(csvpath).then((data) => {
                d3.csv(dataset_radar).then((dataset) => {

                // const svg = d3.select('#svg');
                // const width = +svg.attr('width');
                // const height = +svg.attr('height');
                const width = 900;
                const height = 800;
                const svg = d3.select(id).append("svg")
                            .attr('width', width)
                            .attr("height", height)

                const outerRadius = width * 0.45;
                const innerRadius = outerRadius - 150;

                const indexByName = new Map;
                const nameByIndex = new Map;
                const matrix = [];
                const colores = new Map;
                let n = 0;

                data.forEach(d => {
                    const type = d.type
                    if (!indexByName.has(d = d.name)) {
                        colores.set(n, colorScale[type]);
                        nameByIndex.set(n, d);
                        indexByName.set(d, n++);
                    }
                });

                const data_size = n;

                data.forEach(d => {
                    if (!indexByName.has(d = d.grapes)) {
                        colores.set(n, d3.rgb(121, 121, 121));
                        nameByIndex.set(n, d);
                        indexByName.set(d, n++);
                    }
                });

                data.forEach(d => {
                    const source = indexByName.get(d.name)
                    let row = matrix[source];
                    if (!row) row = matrix[source] = Array.from({length: n}).fill(0);
                    row[indexByName.get(d.grapes)]++;

                });

                data.forEach(d => {
                    const source = indexByName.get(d.grapes)
                    let row = matrix[source];
                    if (!row) row = matrix[source] = Array.from({length: n}).fill(0);
                    row[indexByName.get(d.name)]++;

                });


                const chord = d3.chord()
                    .padAngle(.04)
                    .sortSubgroups(d3.descending)
                    .sortChords(d3.descending)

                const arc = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(innerRadius + 20)

                const ribbon = d3.ribbon()
                    .radius(innerRadius)

                const chords = chord(matrix);


                const g = svg.append("g")
                    .attr("transform", "translate(" + (width -50)/ 2 + "," + (height-100) / 2 + ")")
                    .datum(chord(matrix));

                const group = g.append("g")
                    .selectAll("g")
                    .data(chords.groups)
                    .join("g");

                group.append("path")
                    .attr("fill", d => d3.rgb(colores.get(d.index)).darker())
                    .attr("stroke", d => d3.rgb(colores.get(d.index)).darker())
                    .attr("d", arc)
                // .on("mouseover", onMouseOver)
                // .on("mouseout", onMouseOut);

                group.append("text")
                    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
                    .attr("dy", ".35em")
                    .attr("transform", d => `
              rotate(${(d.angle * 180 / Math.PI - 90)})
              translate(${innerRadius + 26})
              ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
                    .attr("font-size", 9)
                    .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
                    .text(d => {if(d.index<data_size) return nameByIndex.get(d.index)})
                    .attr("fill", "#8c559b")
                    .on("mouseover", (event, d) => onMouseOver(d))
                    .on("mouseout", (event, d) => onMouseOut(d))
                    .append("tspan")
                    .attr("fill", "#2b4c2a")
                    .text(d => {if(d.index>=data_size) return nameByIndex.get(d.index)})
                    .on("mouseover", (event, d) => onMouseOver(d))
                    .on("mouseout", (event, d) => onMouseOut(d));


                function onMouseOver(selected) {
                    // console.log(nameByIndex.get(selected.index))
                    key_filter(nameByIndex.get(selected.index))
                    if(selected.index>=data_size){
                        drawRadialChart(".drawRadialChart", dataset_tree, dataset_radar, "Wine")
                    }
                    else{
                        drawRadialChart(".drawRadialChart", dataset_tree, dataset_radar, nameByIndex.get(selected.index))
                    }
                    var target_index = []
                    for (var i = 0; i < matrix[selected.index].length; i++) {
                        if (matrix[selected.index][i] === 1)
                            target_index.push(i)
                    }
                    group
                        .filter(function (d) {
                            var flag = true
                            for (i in target_index) {
                                if (d.index === target_index[i])
                                    flag = false
                            }
                            return d.index !== selected.index && flag
                        })
                        .style("opacity", 0.2);

                    g.selectAll(".chord")
                        .filter(d => (d.source.index !== selected.index && d.target.index !== selected.index))
                        .style("opacity", 0.1);
                }

                function onMouseOut() {
                    group.style("opacity", 1);
                    g.selectAll(".chord")
                        .style("opacity", 1);
                }

                g.append("g")
                    .attr("fill-opacity", 0.85)
                    .selectAll("path")
                    .data(chords)
                    .join("path")
                    .attr("class", "chord")
                    .attr("stroke", d => d3.rgb(colores.get(d.source.index)))
                    .attr("fill", d => colores.get(d.source.index))
                    .attr("d", ribbon)
                    // .on("mouseover", (event, d) => onMouseOver(d))
                    .on("mouseover", (event, d) => onMouseOver(d.source))
                    .on("mouseout", (event, d) => onMouseOut(d.source));


                var svgLegned = svg.append("g")
                    .attr("transform", "translate(800,550)");

                var keys = [];
                for (const key in colorScale) {
                    keys.push(key);
                }

                var legend = svgLegned.selectAll('g')
                    .data(keys)
                    .enter().append('g')
                    .attr("class", "legends")
                    .attr("transform", function (d, i) {
                        {
                            return "translate(0," + i * 20 + ")"
                        }
                    })

                legend.append('rect')
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", function (d, i) {
                        return colorScale[d]
                    })

                legend.append('text')
                    .attr("x", 20)
                    .attr("y", 5)
                    .attr("dy", ".35em")
                    .text(function (d, i) {
                        return d
                    })
                    .attr("class", "textselected")
                    .style("text-anchor", "start")
                    .style("font-size", 10)




        // d3.csv(dataset_radar)
        // .then((dataset) => {
            let count = key => dataset.filter(d => d.style_varietal_name === key).length
            // console.log(count('Red'))
            var key_list = dataset
                .map(d => d.style_name)
                .filter(d => d)
                .filter((d,i,self) => (self.indexOf(d) === i))
                .filter(d => count(d) >= 10)
            key_list = Array.from(new Set(key_list))

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
            let key=['style_name', 'White']
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


            function key_filter(key) {
                d3.select('#count').text(`Count: ${count(key)}`)

                let new_data = []
                let filtered = dataset
                // .filter(d => valid(d))
                    .filter(d => (d['style_name'] === key))

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

        });
    })
        }
    }

    render() {
        return (

            <div id="radialContainer">
                <Grid spacing={0} container>
                    <Grid md={8} xs={8} item>
                        <h1 align="center">Grape - Style Chord</h1>
                        <div className="drawGrapeChart"></div>
                    </Grid>
                    <Grid xs={0} item>
                        <Grid
                        spacing={0}
                        direction="column"
                        container
                        >
                        <Grid item>
                            <h3 align="center">Top 15 wines of selected style</h3>
                            <div className="drawRadialChart"></div>
                        </Grid>
                        <Grid item>
                            <h3 align="center">Style Radar</h3>
                            <div className="radarChart"></div>
                        </Grid>
                        </Grid>
                    </Grid>
                    {/* <Grid xs={3} item>
                        <Grid
                        spacing={2}
                        direction="column"
                        container
                        >
                        <Grid item>
                            <h1>Intro of this wine style</h1>
                            <p> Text</p>
                        </Grid>
                    </Grid>
                    </Grid> */}
                    </Grid>
        </div>

        )
    }
}
