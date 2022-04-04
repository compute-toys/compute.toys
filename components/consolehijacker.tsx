/*
Remove this pending resolution of this issue
https://github.com/gfx-rs/wgpu/issues/2130
 */

import React, {CSSProperties, Dispatch, SetStateAction, useRef} from "react";
import {ParseError} from "./parseerror";

interface HijackedConsole extends Console {
    _debug(...data: any[]): void;
    _error(...data: any[]): void;
    _info(...data: any[]): void;
    _log(...data: any[]): void;
    _warn(...data: any[]): void;
    _hijacked: boolean;
}

interface ConsoleHijackerProps {
    setError: Dispatch<SetStateAction<ParseError>>
}

export default class ConsoleHijacker extends React.Component<ConsoleHijackerProps, any> {
    constructor(props) {
        super(props);
    }

    error(msg) {
        let captureRegex = /WGPU_PARSE_ERR:(\d+):(\d+):([\s\S]+)/;
        let captureErr = msg.match(captureRegex);
        if (captureErr && captureErr.length == 4) {
            this.props.setError(error => ({
                summary: captureErr[3],
                position: {row: parseInt(captureErr[1]), col: parseInt(captureErr[2])},
                success: false
            }));
            (window.console as HijackedConsole)._log("Hijacking");
        } else {
            (window.console as HijackedConsole)._error(msg);
        }
    }

    // We can also hijack the other console logging functions
    // if neededed but best to avoid it.
    componentDidMount() {
        let console = (window.console as HijackedConsole);
        if (!console._hijacked) {
            console._hijacked = true;
            console._error = window.console.error;
            window.console.error = this.error.bind(this);
        }
    }

    render() {
        return null;
    }
}