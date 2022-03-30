import React, {MutableRefObject} from "react";
import { WgpuToyRenderer, init_wgpu } from "wgputoy";
import { default_shader, default_entry_points } from "./wgpu-defaults"

interface WgpuToyProps {
    code: string,
    bindID: string
    parentRef: MutableRefObject<any>
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
            this.state.wgputoy.set_shader(default_shader, default_entry_points);
            this.state.wgputoy.resize(512, 256);
            this.play();
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.code !== prevProps.code) {
            this.setShader(this.props.code);
        }
        const parentWidth = this.props.parentRef.current.clientWidth;
        this.updateDimensions(parentWidth);
    }

    updateDimensions(parentWidth: number) {
        const baseIncrement = Math.floor(parentWidth / 16.);

        const newWidth = baseIncrement * 16.;
        const newHeight = baseIncrement * 9.;

        if (newWidth !== this.state.width) {
            this.setState({width: newWidth});
            this.state.wgputoy.resize(newWidth, newHeight);
        }
    }

    setShader(_shader: string, _entry_points = default_entry_points) {
        this.state.wgputoy.set_shader(_shader, _entry_points);
    }

    render() {
        return <div id={this.props.bindID}/>;
    }

    play() {
        this.state.wgputoy.render();
        this.setState({requestAnimationFrameID: requestAnimationFrame(() => this.play())});
    }

    pause() {
        cancelAnimationFrame(this.state.requestAnimationFrameID);
    }
}