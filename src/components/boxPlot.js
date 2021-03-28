import React, {Component} from 'react'
import {select} from 'd3-selection'
import '../css/pieChart.css'
import * as d3 from 'd3';
import {colorScale} from '../utils/constant'
import {nest} from 'd3-collection'
import _, { map } from 'underscore'

export default class BoxPlot extends Component {
    constructor(props) {
        super(props)
        this.createBoxPlot = this.createBoxPlot.bind(this)
    }

    componentDidMount() {
        this.createBoxPlot()
    }

    componentDidUpdate() {
        this.createBoxPlot()
    }

    createBoxPlot() {
        const self = this;
        const node = this.node;
        const rawData = this.props.data
        const width = self.props.width;
        const height = self.props.height - 200;
        const margin = ({top: 50, right: 20, bottom: 30, left: 60})

        if (rawData) {
            select(node).selectAll('*').remove()

            const data = nest()
                .key(function (d) {
                    return d.type_name;
                })
                .rollup(function (series) {
                    const bin = series.map(d => d);
                    const values = series.map(d => d.price);
                    values.sort((a, b) => a - b);
                    const min = values[0];
                    const max = values[values.length - 1];
                    const q1 = d3.quantile(values, 0.25);
                    const q2 = d3.quantile(values, 0.50);
                    const q3 = d3.quantile(values, 0.75);
                    const iqr = q3 - q1; // interquartile range
                    const r0 = Math.max(min, q1 - iqr * 1.5);
                    const r1 = Math.min(max, q3 + iqr * 1.5);
                    bin.quartiles = [q1, q2, q3];
                    bin.range = [r0, r1];
                    bin.outliers = bin.filter(v => v.price < 10 || v.price > 1000); // TODO
                    return bin;
                })
                .entries(rawData);


            const x = d3.scaleBand()
                .range([margin.left, width - margin.right])
                .domain(data.map(d => d.key))
                .paddingInner(1)
                .paddingOuter(.5)

            const y = d3.scaleLinear()
                .domain([d3.min(rawData, d => d.price), Math.min(d3.max(rawData, d => d.price), 300)]).nice()
                .range([height - margin.bottom, margin.top])

            const xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(4).tickSizeOuter(0))

            const yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).ticks(null, "s"))
                .call(g => g.select(".domain").remove())

            const boxWidth = 50;
            const jitterWidth = 40;

            const groups = select(node).selectAll("g")
                .data(data)
                .join("g")
                .attr("transform", d => `translate(${x(d.key)}, 0)`)
                .attr("class", d => d.key);


            groups
                .selectAll("vertLine")
                .data(d => [d.value.range])
                .join("line")
                .attr("class", "vertLine")
                .attr("stroke", "#C0C0C0")
                .attr('stroke-width', '1px')
                .style("width", 40)
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", range => y(range[0]))
                .attr("y2", range => y(range[1]));

            groups
                .selectAll("points")
                .data(d => {
                    return (d.value.filter(v => v.price < 300 || !('price' in v)).slice(0, 200))
                    console.log(_.sampleSize([1,2,3,4,5], 3))
                    if (d.value.length > 200) {
                        return d.value.slice(0, 200);
                    } else return d.value;
                    // _.sample(d.value.filter(v => v.price < 300), 200)
                })
                .join("circle")
                .attr("cx", d => 0 - jitterWidth / 2 + Math.random() * jitterWidth)
                .attr("cy", d => y(d.price))
                .attr("r", 2)
                .style("fill", d => colorScale[d.type_name])
                .attr("fill-opacity", 0.9);

            groups
                .selectAll("box")
                .data(d => [d])
                .join("rect")
                .attr("class", "box")
                .attr("x", -boxWidth / 2)
                .attr("y", d => y(d.value.quartiles[2]))
                .attr("height", d => y(d.value.quartiles[0]) - y(d.value.quartiles[2]))
                .attr("width", boxWidth)
                .attr("stroke", "#808080")
                .style("fill", d=>colorScale[d.key])
                .style("fill-opacity", 0.6);

            groups
                .selectAll("horizontalLine")
                .data(d => [d.value.range[0], d.value.quartiles[1], d.value.range[1]])
                .join("line")
                .attr("class", "horizontalLine")
                .attr("stroke", "#808080")
                .attr('stroke-width', '1px')
                .style("width", 40)
                .attr("x1", -boxWidth / 2)
                .attr("x2", +boxWidth / 2)
                .attr("y1", d => y(d))
                .attr("y2", d => y(d));


            select(node).append("g")
                .call(xAxis);

            select(node).append("g")
                .call(yAxis)
        }
    }

    render() {
        return <svg ref={node => this.node = node} data={this.props.data}
                    width={this.props.width} height={this.props.height}>
        </svg>
    }
}

