import React, {Component} from "react";
import * as d3 from "d3";
import {colorCategory, colorScale} from "../utils/constant";
import {select} from 'd3-selection'
import '../../css/networkGraph.css'

const food_data = require('../../data/style_food_data');
const food_link = require('../../data/style_food_link');

const scale = d3.scaleOrdinal(d3.schemeCategory10);
const color = d => scale(d.group)

const drag = simulation => {

    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

export default class NetworkGraph extends Component {
    constructor(props) {
        super(props)
        this.createNetwork = this.createNetwork.bind(this)
        this.state = {'selected': 0, 'refresh': 1}
    }

    componentDidMount() {
        if (this.state['refresh'] === 1) this.createNetwork()
    }

    componentDidUpdate() {
        if (this.state['refresh'] === 1) this.createNetwork()
    }


    createNetwork() {

        const self = this;
        const root = this.node;
        const width = self.props.width;
        const height = self.props.height;
        const imageRadius = 25;

        select(root).selectAll('*').remove();

        const links = food_link.map(d => Object.create(d));
        const nodes = food_data.map(d => Object.create(d));

        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(d => d.__proto__.group === 'Wine' ? -500 : -300))
            .force("center", d3.forceCenter(width / 3, height / 2))

        const link = select(root).append("g")
            .attr("stroke", "#505050")
            .attr("stroke-opacity", 0.5)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.count) / 100);

        const gNode = select(root).selectAll('g.node')
            .data(nodes.filter(d => d.__proto__.group !== 'Wine'))
            .join('svg:g')
            .attr('class', 'node');

        const defs = gNode.append('defs');
        defs.append('pattern')
            .attr("id", d => "image" + d.__proto__.id)
            .attr("width", 1)
            .attr("height", 1)
            .append("svg:image")
            .attr("xlink:href", d => 'http:' + d.__proto__.image)
            .attr("width", imageRadius * 2)
            .attr("height", imageRadius * 2);

        const clickEvent =  d => {
            const id = d.target.__data__.__proto__.id;
            if (self.state.selected !== id) {
                const neighbors = links.reduce((a, b) => {
                    if (b.__proto__.source === id) a.add(b.__proto__.target);
                    else if (b.__proto__.target === id) a.add(b.__proto__.source);
                    return a
                }, new Set());
                neighbors.add(id);
                select(root).selectAll('circle.node').attr('opacity', e => neighbors.has(e.__proto__.id)? (e.__proto__.group === 'Wine' ?1 : 0.9) : 0.3);
                self.setState({'selected': id, 'refresh': 0});
            }
            else {
                select(root).selectAll('circle.node').attr('opacity', 0.9);
                self.setState({'selected': null, 'refresh': 0});
            }
        };

        const mouseOverEvent = d => {
            const data = d.target.__data__.__proto__
            tooltip.transition()
                .duration(100)
                .style("opacity", .8);
            tooltip.html("<p>Name: " + data.name + "</p> <p> Category: " +  `${data.group === 'Wine' ? data.type_name : data.group}` + '</p>')
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


        const node = gNode.append('circle')
            .attr('class', 'node')
            .attr('r', imageRadius)
            .attr("fill", color)
            .attr("stroke", d => colorCategory[d.__proto__.group])
            .attr("stroke-width", 3)
            .attr('stroke-opacity', 0.7)
            .attr('fill', d => `url(#image${d.__proto__.id}`)
            .attr('opacity', 0.9)
            .call(drag(simulation))
            .on('click', clickEvent)
            .on('mouseover.tooltip', mouseOverEvent)
            .on("mouseout.tooltip", mouseOutEvent)
            .on("mousemove", mouseMoveEvent);



        const wine = select(root).append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes.filter(d => d.__proto__.group === 'Wine'))
            .join("circle")
            .attr('class', 'node')
            .attr('r', 10)
            .attr("fill", d => colorScale[d.__proto__.type_name])
            .call(drag(simulation))
            .on('click', clickEvent)
            .on('mouseover.tooltip', mouseOverEvent)
            .on("mouseout.tooltip", mouseOutEvent)
            .on("mousemove", mouseMoveEvent);

        // node.append("title")
        //     .text(d => d.name);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            wine
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        const wineColor = Object.keys(colorScale).reduce((a, b) => {
            a.push({"name": b, "color": colorScale[b]})
            return a
        }, []);


        const wineLegend = select(root).selectAll('.wine-legend')
            .data(wineColor)
            .enter()
            .append('g')
            .attr('class', 'wine-legend')
            .attr('transform', (_, i) => `translate(0, ${i * 20})`)
        ;

        wineLegend.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('stroke', 'black')
            .style('stroke-width', 0.5)
            .style('fill', d => d.color)
        ;

        wineLegend.append('text')
            .attr('x', 15)
            .attr('y', 8)
            .attr('font-size', 10)
            .text(d => d.name)
        ;

        const foodColor = Object.keys(colorCategory).reduce((a, b) => {
            a.push({"name": b, "color": colorCategory[b]})
            return a
        }, []);


        const foodLegend = select(root).selectAll('.food-legend')
            .data(foodColor)
            .enter()
            .append('g')
            .attr('class', 'food-legend')
            .attr('transform', (_, i) => {
                return `translate(100, ${i * 20 + 8})`
            })
        ;

        foodLegend.append('circle')
            .attr('r', 6)
            .attr('stroke', d => d.color)
            .attr('stroke-width', 1.5)
            .attr('fill', 'none');

        foodLegend.append('text')
            .attr('x', 15)
            .attr('y', 2)
            .attr('font-size', 10)
            .text(d => d.name)
        ;
    }

    render() {
        return <svg ref={node => this.node = node}
            // viewBox={[this.props.width / 4, this.props.height / 4, this.props.width / 2, this.props.height / 2]}
                    width={this.props.width} height={this.props.height}>
        </svg>
    }
}
