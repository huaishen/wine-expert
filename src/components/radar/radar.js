import React from "react";
import * as d3 from 'd3';
import {RadarChart} from "./RadarChart"
import originData from '../../data/sliced.csv'
import '../../css/radarChart.css'

var type_id = 1
var type_data = {
    1: ['Cabernet Sauvignon',
        'Pinot Noir',
        'Syrah',
        'Malbec',
        'Shiraz',
        'Côte de Nuits Red',
        'Merlot',
        'Côte de Beaune Red'],
    2: ['Chardonnay',
        'Riesling',
        'Sauvignon Blanc',
        'Côte de Beaune White',
        'Macônnais White',
        'Chablis',
        'Chenin Blanc',
        'Pinot Grigio'],
    3: ['Champagne', 'Prosecco', 'Cava', 'Cremant'],
    4: ['Rosé', 'Pinot Grigio', 'Pinot Noir'],
    5: ['Sherry', 'Madeira', 'Pedro Ximenez'],
    6: ['Sauternes', 'Riesling', 'Chenin Blanc', 'Soave']
}


var margin = {top: 50, right: 25, bottom: 50, left: 25},
    width = Math.min(700, window.innerWidth * 0.8 / 4 - 10) - margin.left - margin.right,
    height = Math.min(width, window.innerHeight * 0.8 - margin.top - margin.bottom - 20);

var labels = ['rating', 'price', 'tannin', 'sweetness', 'intensity', 'acidity', 'fizziness']
var type_labels = {
    1: ['rating', 'price', 'sweetness', 'intensity', 'tannin', 'acidity'],
    2: ['rating', 'price', 'sweetness', 'intensity', 'acidity'],
    3: ['rating', 'price', 'fizziness', 'intensity', 'acidity'],
    4: ['rating', 'price', 'sweetness', 'intensity', 'acidity'],
    5: ['rating', 'price', 'sweetness', 'intensity', 'acidity'],
}
var color = {
    1: d3.scaleOrdinal().range(['rgba(177,18,38,0.73)']),
    2: d3.scaleOrdinal().range(['#e4b953']),
    3: d3.scaleOrdinal().range(['#898ebe']),
    4: d3.scaleOrdinal().range(['#CC337F']),
    5: d3.scaleOrdinal().range(['#722f37']),
}

const type_map = {"Red": 1, "White": 2, "Sparkling": 3, "Rose": 4, "Fortified": 5, "Dessert": 6}

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


export default class StyleRadar extends React.Component {
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        d3.csv(originData)
            .then((dataset) => {

                const sum = (a, b) => a + b


                // build scales
                let parseF = str => (str ? parseFloat(str) : 0)
                let parseS = str => (str ? str : 'Unknown')
                let range = [0.03, 0.001]
                let scales = {}
                labels.map(l => {
                    let sorted = dataset.map(d => d[l])
                        .filter(v => v)
                        .sort((a, b) => a - b)

                    let lrange = l == 'rating' || l == 'price' ? range[1] : range[0]

                    scales[l] = d3.scaleLinear()
                        .domain([d3.min(dataset, (d) => parseF(sorted[Math.floor(sorted.length * lrange)])),
                            d3.max(dataset, (d) => parseF(sorted[Math.floor(sorted.length * (1 - lrange))]))])
                        .range([0.1, 1])
                })


                // function to get data & draw chart
                const key_filter = (key, chart_id) => {
                    console.log(key, chart_id)
                    let count = key => dataset.filter(d => d.style_varietal_name === key).length
                    d3.select('#count').text(`Count: ${count(key)}`)

                    let new_data = []
                    let tlabels = type_labels[type_id]
                    const valid = d => (tlabels.map(l => (d[l] ? 1 : 0)).reduce(sum, 0) >= tlabels.length)
                    const filtered = dataset
                        .filter(d => valid(d))
                        .filter(d => d['style_varietal_name'] == key)

                    filtered.forEach((d, i) => {
                        new_data.push(tlabels.map(l => {
                            let lowbound = 0, upbound = 1.1
                            let value = scales[l](parseF(d[l]))
                            value = Math.min(Math.max(value, lowbound), upbound)
                            return {axis: l, value: value, actValue: parseS(d[l])}
                        }))
                    })
                    radarChartOptions.labels = tlabels
                    radarChartOptions.color = color[type_id]
                    RadarChart(`#${chart_id}`, new_data, radarChartOptions);
                }


                // tap header click event
                d3.selectAll('.tablink').on('click', function (e) {
                    let type_name = e.toElement.name
                    type_id = type_map[type_name]
                    d3.selectAll(".tabcontent").style("display", "none")
                    d3.selectAll(".tablink").style('background-color', '')

                    let block = d3.select(`#${type_name}`).style("display", "grid")

                    // build contents
                    block.selectAll('.grid-item').remove()
                    const items = block.selectAll('.grid-item')
                        .data(type_data[type_id])
                        .enter()
                        .append('div')
                        .attr('class', 'grid-item')

                    items.append('div')
                        .attr('class', 'radar-chart')
                        .attr('id', (d, i) => `${type_name}${i}`)
                        .each((d, i) => {
                            key_filter(d, `${type_name}${i}`)
                        })
                    e.toElement.style.backgroundColor = '#d62728';

                    items.append('h1')
                        .text(d => d)
                })

                document.getElementsByName("Red")[0].click();

            })
    }

    render() {
        return (
            <div id="radarContainer">
                <button className="tablink" name="Red">Red Wine</button>
                <button className="tablink" name="White">White Wine</button>
                <button className="tablink" name="Sparkling">Sparkling</button>
                <button className="tablink" name="Rose">Rose</button>
                <button className="tablink" name="Fortified">Fortified</button>


                <div id="Red" className="tabcontent grid-container">
                </div>

                <div id="White" className="tabcontent grid-container">
                </div>

                <div id="Sparkling" className="tabcontent grid-container">
                </div>

                <div id="Rose" className="tabcontent grid-container">
                </div>

                <div id="Fortified" className="tabcontent grid-container">
                </div>
            </div>

        )

    }
}
