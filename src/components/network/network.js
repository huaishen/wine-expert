import React from "react";
import NetworkGraph from './networkGraph'
import Grid from "@material-ui/core/Grid";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import '../../css/wineCard.css'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const food_data = require('../../data/style_food_data');
const food_link = require('../../data/style_food_link');
const wine_styles = require('../../data/style_wines');

function createData(name, calories, fat, carbs, protein) {
    return {name, calories, fat, carbs, protein};
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default class FoodNetwork extends React.Component {

    constructor(props) {
        super(props);
        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    state = {
        dimensions: {
            width: 1000,
            height: 800
        },
        selectedStyle: null,
        open: false
    };

    networkCallbackFunction = (style) => {
        if (typeof style === 'string' && style.startsWith('w')) {
            const filterData = wine_styles.filter(x => x.id === style)[0]
            this.setState({selectedStyle: filterData});
            console.log(filterData)
        } else this.setState({selectedStyle: null})
    };


    componentDidMount() {
        this.setState({
            dimensions: {
                width: this.container.offsetWidth,
                height: this.container.offsetHeight
            }
        })
    }


    handleClickOpen = () => {
        this.setState({open: true})
    };

    handleClose = () => {
        this.setState({open: false})
    };


    renderContent() {
        const {dimensions} = this.state;
        const style = this.state.selectedStyle;

        return (
            <div>
                <Grid container spacing={1}>
                    <Grid item>
                        <NetworkGraph width={dimensions.width} height={dimensions.height} food_data={food_data}
                                      food_link={food_link} parentCallback={this.networkCallbackFunction}/>
                    </Grid>
                    { this.state.selectedStyle ? <Button className="show-button" variant="outlined" color="primary" onClick={this.handleClickOpen}>
                        Show me more about the wine style
                    </Button> : null }
                    <Dialog maxWidth={"md"} open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                        {
                            style ?
                                <div className="wine-card">
                                    <DialogTitle>
                                        <Typography variant="h5" align="center" gutterBottom>
                                            {style.name}
                                        </Typography>
                                    </DialogTitle>
                                    <Typography align="center" gutterBottom>
                                        <b>Style Acidity</b>: {style.wines[0].style_acidity_desp} &nbsp;&nbsp;&nbsp;
                                        <b>Style body</b>: {style.wines[0].style_body_desp}
                                    </Typography>
                                    <TableContainer>
                                        <Table className="wine-table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell align="right">Rating</TableCell>
                                                    <TableCell align="right">Price</TableCell>
                                                    <TableCell align="right">Country</TableCell>
                                                    <TableCell align="right">Region</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {this.state.selectedStyle.wines.map((row) => (
                                                    <TableRow key={row.id}>
                                                        <TableCell component="th" scope="row">
                                                            {row.name}
                                                        </TableCell>
                                                        <TableCell align="right">{row.rating}</TableCell>
                                                        <TableCell align="right">{row.price}</TableCell>
                                                        <TableCell align="right">{row.country_name}</TableCell>
                                                        <TableCell align="right">{row.region_name}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                                : null
                        }
                    </Dialog>
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
