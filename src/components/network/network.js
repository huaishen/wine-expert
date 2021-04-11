import React from "react";
import NetworkGraph from './networkGraph'

export default class FoodNetwork extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        dimensions: {
            width: 1000,
            height: 800
        }
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
        const { dimensions } = this.state;

        return (
            <NetworkGraph width={dimensions.width} height={dimensions.height} />
        );
    }

    render() {
        const { dimensions } = this.state;

        return (
            <div ref={el => (this.container = el)}>
                {dimensions && this.renderContent()}
            </div>
        );
    }
}
