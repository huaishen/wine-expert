import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import List from '@material-ui/core/List';
import '../css/iconfont.css'
import {Link as RouterLink} from 'react-router-dom';
import ListItemText from '@material-ui/core/ListItemText';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

function ListItemLink(props) {
    const {icon, primary, to} = props;

    const renderLink = React.useMemo(
        () => React.forwardRef((itemProps, ref) => <RouterLink to={to} ref={ref} {...itemProps} />),
        [to],
    );

    return (
        <li>
            <ListItem button component={renderLink}>
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={primary}/>
            </ListItem>
        </li>
    );
}

ListItemLink.propTypes = {
    icon: PropTypes.element,
    primary: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
};

const useStyles = makeStyles({
    root: {
        width: 250,
    },
});

export default function ListRouter() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Paper elevation={0}>
                <List aria-label="main">
                    <ListItemLink to="/map" primary="Wine Map" icon={<i className="iconfont icon-map"/>}/>
                    <ListItemLink to="/radar" primary="Taste Radar" icon={<i className="iconfont icon-radar"/>}/>
                    <ListItemLink to="/tree" primary="Grape-Style Chord" icon={<i className="iconfont icon-tp_radial"/>}/>
                    <ListItemLink to="/network" primary="Food Pair Network" icon={<i className="iconfont icon-network1"/>}/>
                </List>
            </Paper>
        </div>
    );
}

