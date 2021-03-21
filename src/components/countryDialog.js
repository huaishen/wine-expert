import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import {withStyles} from "@material-ui/core/styles";
import Slide from '@material-ui/core/Slide';
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper';
import PieChart from './pieChart'
import BarChart from './barChart'
import TreeChart from './treeChart'
import BoxPlot from './boxPlot'

const styles = (theme) => ({
    root: {
        flewGrow: 1
    },
    appBar: {
        backgroundColor: '#722f37',
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    statsHeader: {
        textAlign: 'center',
        color: '#480027',
        paddingTop: '20px',
        marginBottom: '50px'
    },
    graphHeader: {
        textAlign: 'center',
        color: '#480027',
        marginBottom: '8px'
    },
    statsContent: {
        color: '#920036'
    },
    gridCard: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        minHeight: '250px',
    }

});

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


class FullScreenDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fullData: this.props.activeData,
            useData: this.props.activeData,
            priceData: this.props.priceData,
            filter: this.props.activeData.name,
            filter_column: 'country_name',
            usePriceData: this.props.priceData
        }
        this.treeCallbackFunction = this.treeCallbackFunction.bind(this)
        this.myDiv = React.createRef()
    }

    componentDidUpdate() {
        const self = this;
        if (self.state.fullData !== self.props.activeData) {
            self.setState({
                fullData: self.props.activeData, useData: self.props.activeData, priceData:
                self.props.priceData, filter: this.props.activeData.name, usePriceData: self.props.priceData
            });
        }
    }

    treeCallbackFunction = (selectedName, depth) => {
        if (this.state.filter === selectedName || depth === 0) {
            this.setState({
                filter: this.state.fullData.name,
                useData: this.state.fullData,
                usePriceData: this.state.priceData
            })
        } else {
            var data;
            if (depth === 1) {
                data = this.state.fullData.children.filter(d => d.name === selectedName);
                this.setState({usePriceData: this.state.priceData.filter(d => d.region_name === selectedName)})
            } else {
                let temp = [];
                this.state.fullData.children.forEach(d => temp.push(...d.children));
                data = temp.filter(d => d.name === selectedName)
                this.setState({usePriceData: this.state.priceData.filter(d => d.winery_name === selectedName)})
            }
            this.setState({filter: selectedName, useData: data[0]})
        }
    };

    render() {
        const {classes} = this.props;
        return (
            <div ref={this.myDiv}>
                <Dialog fullScreen open={this.props.open} onClose={this.props.closeDialog}
                        TransitionComponent={Transition}>
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={this.props.closeDialog}
                                        aria-label="close">
                                <CloseIcon/>
                            </IconButton>
                            <Typography variant="h6" className={classes.title}>
                                {this.props.properties.name}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <div className={classes.root}>
                        <Grid container spacing={3}>
                            <Grid item xs>
                                <Paper className={classes.gridCard}>
                                    <h1 className={classes.statsHeader}>Number of Wineries</h1>
                                    <h1 className={classes.statsContent}>{this.state.useData.winery_count || 1}</h1>
                                </Paper>
                            </Grid>
                            <Grid item xs>
                                <Paper className={classes.gridCard}>
                                    <h1 className={classes.statsHeader}>Number of Wines</h1>

                                    <h1 className={classes.statsContent}>{this.state.useData.wine_count}</h1>
                                </Paper>
                            </Grid>
                            <Grid item xs>
                                <h1 className={classes.graphHeader}>Wine Type</h1>
                                <PieChart data={this.state.useData.type_count} width='300' height='250'/>
                            </Grid>
                            <Grid item xs>
                                <h1 className={classes.graphHeader}>Grape Type</h1>
                                <BarChart data={this.state.useData.grape_count} width='400' height='220'/>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs>
                                <h1 className={classes.graphHeader}>Winery Dendrogram</h1>
                                <TreeChart data={this.state.fullData} width='1000' height='1000'
                                           name={this.state.filter}
                                           parentCallback={this.treeCallbackFunction}/>
                            </Grid>
                            <Grid item xs>
                                <h1 className={classes.graphHeader}> Price Boxplot</h1>
                                <BoxPlot width='400' height='600' data={this.state.usePriceData}/>
                            </Grid>
                        </Grid>
                    </div>
                </Dialog>
            </div>
        );
    }

}

export default withStyles(styles, {withTheme: true})(FullScreenDialog);
