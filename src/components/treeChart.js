import React, {Component} from 'react'
import {select} from 'd3-selection'
import * as d3 from 'd3';
import { colorScale } from '../utils/constant'
import '../css/treeChart.css'

export default class TreeChart extends Component {
    constructor(props) {
        super(props)
        this.state = {
            outerRadius: 100,
            innerRadius: 10,

        }

        this.createTreeChart = this.createTreeChart.bind(this)
        // const width = 2 * this.state.outerRadius + margin.left + margin.right;
        // const height = 2 * this.state.outerRadius + margin.top + margin.bottom;


    }

    componentDidMount() {
        this.createTreeChart()
    }

    componentDidUpdate() {
        this.createTreeChart()
    }

    createTreeChart() {
        const self = this;
        const node = this.node;
        const data = self.props.data;
        const width = self.props.width - 100;
        const margin = {
            top: 40, right: 20, bottom: 20, left: 50,
        }

        if (data) {
            select(node).selectAll('*').remove()

            const tree = data => {
                const root = d3.hierarchy(data).sort((a, b) => {
                    d3.descending(a.height, b.height) || d3.ascending(a.data.name, b.data.name)
                });
                root.dx = 10;
                root.dy = width / (root.height + 1);
                return d3.cluster().nodeSize([root.dx, root.dy])(root);
            };

            const root = tree(data);

            const maxHeight = -root.links()[0].target.children[0].x + margin.top ;

            const g = select(node).append('g')
                .attr('transform', `translate(150, ${maxHeight})`);

            g.append("g")
                .attr("fill", "none")
                .attr("stroke", "#555")
                .attr("stroke-opacity", 0.4)
                .attr("stroke-width", 1.5)
                .selectAll("path")
                .data(root.links())
                .join("path")
                .attr("d", d => `
        M${d.target.y},${d.target.x}
        C${d.source.y + root.dy / 2},${d.target.x}
         ${d.source.y + root.dy / 2},${d.source.x}
         ${d.source.y},${d.source.x}
      `);

            g.append("g")
                .selectAll("circle")
                .data(root.descendants())
                .join("circle")
                .attr('class', 'treeNode')
                .attr("cx", d => d.y)
                .attr("cy", d => d.x)
                .attr("fill", d => d.children ? "#920036" : "#722f37")
                .attr("stroke", 'black')
                .attr("stroke-width", 1)
                .attr("r", 3.5)
                .attr("opacity", d => d.data.name === self.props.name? 1 : 0.6)
                .on('click', (_, d)=> self.props.parentCallback(d.data.name, d.depth));

            g.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .selectAll("text")
                .data(root.descendants())
                .join("text")
                .attr("x", d => d.y)
                .attr("y", d => d.x)
                .attr("dy", "0.31em")
                .attr("dx", d => d.children ? -6 : 6)
                .text(d => d.data.name)
                .filter(d => d.children)
                .attr("text-anchor", "end")
                .clone(true).lower()
                .attr("stroke", "white");
        }


    }

    render() {
        return <svg ref={node => this.node = node}
                    width={this.props.width} height={this.props.height}>
        </svg>
    }
}

