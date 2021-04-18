import React from "react";
import NetworkGraph from './networkGraph'
import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import '../../css/wineCard.css'
import TreeChart from "../map/treeChart";

const food_data = require('../../data/style_food_data');
const food_link = require('../../data/style_food_link');

console.log(food_data)

export default class FoodNetwork extends React.Component {

    constructor(props) {
        super(props);
    }

    state = {
        dimensions: {
            width: 1000,
            height: 800
        },
        selectedStyle: null
    };

    networkCallbackFunction = (style) => {
        if (typeof style === 'string' && style.startsWith('w')) {
            const filterData = food_data.filter(x => x.id === style)[0]
            this.setState({selectedStyle: filterData});
        }
        else this.setState({selectedStyle: null})
    };


    componentDidMount() {
        this.setState({
            dimensions: {
                width: this.container.offsetWidth,
                height: this.container.offsetHeight
            }
        })
    }

    renderContent() {
        const {dimensions} = this.state;


        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item xs={8}>
                        <NetworkGraph width={dimensions.width} height={dimensions.height} food_data={food_data}
                                      food_link={food_link}  parentCallback={this.networkCallbackFunction}/>
                    </Grid>
                    <Grid item>
                        {
                            this.state.selectedStyle?
                                <Card className="wine-card">
                                    <CardContent>
                                        <Typography variant="h5" align="center" gutterBottom>
                                            Wine Style
                                        </Typography>
                                        <Typography variant="h6" color="textPrimary">
                                            { this.state.selectedStyle.name}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                    </CardActions>
                                </Card>
                                : null
                        }
                    </Grid>
                </Grid>
            </div>

        );
    }

    render() {
        const {dimensions} = this.state;

        return (
            <div ref={el => (this.container = el)}>
                {dimensions && this.renderContent()}
            </div>
        );
    }
}
