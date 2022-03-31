import React, {CSSProperties, lazy, MutableRefObject} from "react";
import { WgpuToyRenderer, init_wgpu } from "wgputoy";
import { default_shader } from "./wgpu-defaults"

interface WgpuToyProps {
    code: string,
    bindID: string
    parentWidth: number
    style: CSSProperties
}

interface WgpuToyState {
    wgputoy: WgpuToyRenderer,
    requestAnimationFrameID: number,
    width: number
}

export default class WgpuToy extends React.Component<WgpuToyProps, WgpuToyState> {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        init_wgpu(this.props.bindID).then(ctx => {
            this.setState({wgputoy: new WgpuToyRenderer(ctx)});
            this.state.wgputoy.set_shader(default_shader);
            this.updateDimensions();
            this.play();
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.code !== prevProps.code) {
            this.setShader(this.props.code);
        }

        if (this.props.parentWidth !== prevProps.parentWidth) {
            this.updateDimensions();
        }

    }

    updateDimensions() {
        const parentWidth = this.props.parentWidth;
        const baseIncrement = Math.max(Math.floor(parentWidth / 32)-1,1);

        const newWidth = baseIncrement * 32;
        const newHeight = baseIncrement * 18;

        if (this.state && newWidth !== this.state.width) {
            this.setState({width: newWidth});
            this.state.wgputoy.resize(newWidth, newHeight);
        }
    }

    setShader(_shader: string) {
        this.state.wgputoy.set_shader(_shader);
    }

    play() {
        this.state.wgputoy.render();
        this.setState({requestAnimationFrameID: requestAnimationFrame(() => this.play())});
    }

    pause() {
        cancelAnimationFrame(this.state.requestAnimationFrameID);
    }

    render() {
        return <canvas id={this.props.bindID} style={this.props.style}/>;
    }
}