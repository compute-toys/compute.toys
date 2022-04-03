import React, {CSSProperties, Dispatch, lazy, MutableRefObject, SetStateAction} from "react";
import { WgpuToyRenderer, init_wgpu } from "wgputoy";
import { default_shader } from "./wgpu-defaults"
import {ParseError} from "./parseerror";

interface WgpuToyProps {
    code: string,
    bindID: string,
    parentWidth: number,
    style: CSSProperties,
    play: boolean,
    setPlay: Dispatch<SetStateAction<boolean>>
    reset: boolean,
    setReset: Dispatch<SetStateAction<boolean>>
    hotReload: boolean
    manualReload: boolean
    setManualReload: Dispatch<SetStateAction<boolean>>
    setError: Dispatch<SetStateAction<ParseError>>
}

interface MousePosition {
    x: number,
    y: number
}

interface Dimensions {
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

    handleError(summary, row, col) {
        this.props.setError(error => ({
            summary: summary,
            position: {row: Number(row), col: Number(col)},
            success: false
        }));
    }

    resetError() {
        this.props.setError(error => ({
            summary: undefined,
            position: {row: undefined, col: undefined},
            success: true
        }));
    }

    componentDidMount() {
        init_wgpu(this.props.bindID).then(ctx => {
            this.setState({wgputoy: new WgpuToyRenderer(ctx)});
            this.state.wgputoy.set_shader(default_shader);
            this.state.wgputoy.on_error(this.handleError.bind(this))
            this.updateDimensions();

            // this is the only place we want to set play manually, otherwise it's UI-driven
            this.play();
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.wgputoy) { //needed in race-y circumstances
            // if code changed and we're hot reloading, or
            // hot reloading was just enabled, or
            // user decided to manually reload
            if ((this.props.hotReload && this.props.code !== prevProps.code)
                || (this.props.hotReload && !prevProps.hotReload)
                || (this.props.manualReload && !prevProps.manualReload)
            ) {
                this.setShader(this.props.code);
                this.props.setManualReload(false);
            }

            if (this.props.parentWidth !== prevProps.parentWidth) {
                this.updateDimensions();
            }

            if (this.props.play !== prevProps.play) {
                this.togglePlay();
            }

            if (this.props.reset && (this.props.reset !== prevProps.reset)) {
                this.reset();
            }

            if (this.state.mouse !== prevState.mouse || this.state.click !== prevState.click) {
                this.updateMouse();
            }
        }
    }

    getDimensions(parentWidth: number): Dimensions {
        const baseIncrement = Math.max(Math.floor(parentWidth / 32)-1,1);
        return {x: baseIncrement * 32, y: baseIncrement * 18};
    }

    // just an unconditional version of resize(),
    // consider a dedicated approach for reset()
    reset() {
        const dimensions = this.getDimensions(this.props.parentWidth);
        this.state.wgputoy.resize(dimensions.x, dimensions.y);
        this.props.setReset(false);
    }

    updateMouse() {
        this.state.wgputoy.set_mouse_click(this.state.click);
        this.state.wgputoy.set_mouse_pos(this.state.mouse.x, this.state.mouse.y)
    }

    updateDimensions() {
        const dimensions = this.getDimensions(this.props.parentWidth);
        if (this.state.wgputoy && this.state && dimensions.x !== this.state.width) {
            this.setState({width: dimensions.x});
            this.state.wgputoy.resize(dimensions.x, dimensions.y);
        }
    }

    setShader(_shader: string) {
        this.resetError();
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