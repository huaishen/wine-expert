import React, {Component} from 'react'
import {select} from 'd3-selection'
import '../../css/pieChart.css'
import * as d3 from 'd3';
import {colorScale} from '../utils/constant'

export default class PieChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            outerRadius: 100,
            innerRadius: 40
        }

        this.createPieChart = this.createPieChart.bind(this)
        const margin = {
            top: 50, right: 50, bottom: 50, left: 50,
        };

    }

    componentDidMount() {
        this.createPieChart()
    }

    componentDidUpdate() {
        this.createPieChart()
    }

    createPieChart() {
        const self = this;
        const node = this.node;
        const data = this.props.data;
        const width = self.props.width;

        if (data) {
            let colorData = [];
            for (let type in colorScale) {
                if (data.filter(d => d.name === type).length > 0) colorData.push({
                    'name': type,
                    'color': colorScale[type]
                });
            }

            select(node).selectAll('*').remove();

            const tooltip = d3.select('div.FullScreenDialog-root-17')
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            const arcGenerator = d3
                .arc()
                .innerRadius(self.state.innerRadius)
                .outerRadius(self.state.outerRadius);

            const pieGenerator = d3
                .pie()
                .padAngle(0)
                .value((d) => d.value);

            const g = select(node)
                .append('g')
                .attr('transform', `translate(120, 100)`);

            const l = select(node)
                .append('g')
                .attr('transform', `translate(${parseInt(width) - 70}, 40)`);

            const arc = g
                .selectAll()
                .data(pieGenerator(data))
                .enter();

            const mouseOverEvent = d => {
                const data = d.target.__data__.data;
                tooltip.transition()
                    .duration(100)
                    .style("opacity", .8);
                tooltip.html("<p>Name: " + data.name + "</p> <p> Wine Count: " + data.value  + "</p>")
                    .style("left", () => d.pageX + 'px')
                    .style("top", () => d.pageY + 'px');
            };

            const mouseOutEvent = () => {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            };

            const mouseMoveEvent = d => {
                tooltip.style("left", (d.pageX) + "px")
                    .style("top", (d.pageY) + "px");
            };

            arc.append('path')
                .attr('d', arcGenerator)
                .style('fill', (i, _) => colorScale[i.data.name])
                .style('stroke', '#474747')
                .style('stroke-width', 1)
                .style('stroke-opacity', 0.6)
                .on('mouseover.tooltip', mouseOverEvent)
                .on("mouseout.tooltip", mouseOutEvent)
                .on("mousemove", mouseMoveEvent);


            const legend = l.selectAll('.chart-legend')
                .data(colorData)
                .enter()
                .append('g')
                .attr('class', 'chart-legend')
                .attr('transform', (_, i) => `translate(0, ${i * 20})`)
            ;

            legend.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('stroke', 'black')
                .style('stroke-width', 0.5)
                .style('fill', d => d.color)
            ;

            legend.append('text')
                .attr('x', 15)
                .attr('y', 8)
                .attr('font-size', 10)
                .text(d => d.name)
            ;
        }

    }

    render() {
        return <svg ref={node => this.node = node} data={this.props.data}
                    width={this.props.width} height={this.props.height}>
        </svg>
    }
}

