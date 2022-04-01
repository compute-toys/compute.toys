import React, {CSSProperties, Dispatch, lazy, MutableRefObject, SetStateAction} from "react";
import { WgpuToyRenderer, init_wgpu } from "wgputoy";
import { default_shader } from "./wgpu-defaults"

interface WgpuToyProps {
    code: string,
    bindID: string,
    parentWidth: number,
    style: CSSProperties,
    play: boolean,
    setPlay: Dispatch<SetStateAction<boolean>>
}

interface MousePosition {
    x: number,
    y: number
}

interface WgpuToyState {
    wgputoy: WgpuToyRenderer,
    requestAnimationFrameID: number,
    width: number,
    mouse: MousePosition,
    click: boolean
}

export default class WgpuToy extends React.Component<WgpuToyProps, WgpuToyState> {
    constructor(props) {
        super(props);
        this.state = {
            wgputoy: null,
            requestAnimationFrameID: 0,
            width: 0,
            mouse: {x: 0, y: 0},
            click: false
        }
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    handleMouseMove(e) {
        this.setState({ mouse: {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }});
    }

    handleMouseUp(e) {
        this.setState({click: false});
    }

    handleMouseDown(e) {
        this.setState({click: true});
    }

    componentDidMount() {
        init_wgpu(this.props.bindID).then(ctx => {
            this.setState({wgputoy: new WgpuToyRenderer(ctx)});
            this.state.wgputoy.set_shader(default_shader);
            this.updateDimensions();

            // this is the only place we want to set play manually, otherwise it's UI-driven
            this.play();
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.code !== prevProps.code) {
            this.setShader(this.props.code);
        }

        if (this.props.parentWidth !== prevProps.parentWidth) {
            this.updateDimensions();
        }

        if (this.props.play !== prevProps.play) {
            this.togglePlay();
        }

        if (this.state.mouse !== prevState.mouse || this.state.click !== prevState.click) {
            this.updateMouse();
        }

    }

    updateMouse() {
        this.state.wgputoy.set_mouse_click(this.state.click);
        this.state.wgputoy.set_mouse_pos(this.state.mouse.x, this.state.mouse.y)
    }

    updateDimensions() {
        const parentWidth = this.props.parentWidth;
        const baseIncrement = Math.max(Math.floor(parentWidth / 32)-1,1);

        const newWidth = baseIncrement * 32;
        const newHeight = baseIncrement * 18;

        if (this.state.wgputoy && this.state && newWidth !== this.state.width) {
            this.setState({width: newWidth});
            this.state.wgputoy.resize(newWidth, newHeight);
        }
    }

    setShader(_shader: string) {
        this.state.wgputoy.set_shader(_shader);
    }

    togglePlay() {
        if (this.props.play) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        this.state.wgputoy.render();
        this.setState({requestAnimationFrameID: requestAnimationFrame(() => this.play())});
    }

    pause() {
        cancelAnimationFrame(this.state.requestAnimationFrameID);
    }

    render() {
        return (
            <canvas
                onMouseMove={this.handleMouseMove}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseUp}
                id={this.props.bindID}
                style={this.props.style}
            />
        );
    }
}