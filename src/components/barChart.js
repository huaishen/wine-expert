import React, {Component} from 'react'
import {select} from 'd3-selection'
import * as d3 from 'd3';
import { colorScale } from '../utils/constant'

export default class BarChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            outerRadius: 100,
            innerRadius: 10,
            margin : {
                top: 10, right: 20, bottom: 20, left: 40,
            }
        }

        this.createBarChart = this.createBarChart.bind(this)
        // const width = 2 * this.state.outerRadius + margin.left + margin.right;
        // const height = 2 * this.state.outerRadius + margin.top + margin.bottom;


    }

    componentDidMount() {
        this.createBarChart()
    }

    componentDidUpdate() {
        this.createBarChart()
    }

    createBarChart() {
        const self = this;
        const node = this.node;
        const data = self.props.data.sort((a, b) => b.count - a.count).slice(0, 5);
        const margin = this.state.margin;
        const width = self.props.width;
        const height = self.props.height;

        if (data) {
            select(node).selectAll('*').remove()

            const x = d3.scaleBand()
                .domain(d3.range(data.length))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.count)]).nice()
                .range([height - margin.bottom, margin.top]);

            const xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickFormat(i => data[i].name).tickSizeOuter(0));

            const yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).ticks(5))
                .call(g => g.append("text")
                    .attr("x", -margin.left)
                    .attr("y", 10)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "start")
                    .text(data.y));

            const g = select(node)
                .append('g');

            g.append("g")
                .selectAll("rect")
                .data(data)
                .join("rect")
                .attr("fill", "red")
                .attr("x", (d, i) => x(i))
                .attr("y", d => y(d.count))
                .attr("height", d => y(0) - y(d.count))
                .attr("width", x.bandwidth())
                .attr('stroke', 'black');

            g.append("g")
                .call(xAxis)
                .selectAll("text")
                .attr("font-size", 8.5)

            g.append("g")
                .call(yAxis);
        }


        // arc.append('text')
        //     .attr('text-anchor', 'middle')
        //     .attr('alignment-baseline', 'middle')
        //     .text((d) => d.data.name)
        //     .attr('font-size', 15)
        //     .style('fill', '#ffffff')
        //     .attr('transform', (d) => {
        //         const [x, y] = arcGenerator.centroid(d);
        //         return `translate(${x}, ${y})`;
        //     });

    }

    render() {
        return <svg ref={node => this.node = node}
                    width={this.props.width} height={this.props.height}>
        </svg>
    }
}

