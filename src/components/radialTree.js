import React from "react";
import * as d3 from 'd3';
import Grid from "@material-ui/core/Grid";
import dataset from "../data/wine_name_grapes.csv";
import '../css/radialTree.css'
import drawGrapeChart from './grape'

export default class RadialTree extends React.Component {
    constructor(props) {
        super(props);
    }


    componentDidMount() {
        drawGrapeChart(dataset)

    }

    render() {
        return (
            <div id="radarContainer">
                <Grid container spacing={3}>
                    <Grid className="centerContainer" item xs>
                        <svg width="1200" height="1000" id="svg" className="svgs"></svg>
                        <script src="./grape.js"></script>
                    </Grid>
                </Grid>


            </div>

        )

    }
}
