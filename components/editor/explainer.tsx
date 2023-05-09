import {Item, theme} from 'theme/theme';
import Draggable from 'react-draggable';
import {Fragment, useEffect, useRef, useState} from "react";
import {DisabledByDefaultSharp} from "@mui/icons-material";
import {wgputoyAtom} from "../../lib/atoms/wgputoyatoms";
import {useAtomValue} from "jotai";
import Logo from "../global/logo";
import {WgpuToyRenderer} from "../../lib/wgputoy";
import {Button} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import dynamic from "next/dynamic";
import Link from 'next/link';

const HiLite = (props) => {
    const theme = useTheme();
    return (
           <span style={{color: theme.palette.primary.contrastText}}>{props.children}</span>
    );
}

const EXPLAINER_HEIGHT = "600";
const EXPLAINER_INNER_HEIGHT = "570";

const DraggableExplainer = (props) => {
    const theme = useTheme();

    // Draggable needs this so React doesn't complain
    // about violating strict mode DOM access rules
    const nodeRef = useRef(null);

    const Prelude = dynamic(() => import('./preludeshim'), {ssr: false});

    return (
        <Draggable handle=".explainer-handle" nodeRef={nodeRef} bounds="body" positionOffset={{x:'0',y:'0'}}>
            <Item ref={nodeRef} elevation={12}
                  sx={
                      props.hidden ? {display: 'none'} :
                          {
                              zIndex: '2',
                              display: 'inline-block',
                              position: 'fixed',
                              left: '12%',
                              top: '12%',
                              textAlign: 'left',
                              height: `${EXPLAINER_HEIGHT}px`
                          }
                  }
            >
                <div className="explainer-handle" style={{display: 'flex', justifyContent: 'end',
                    backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255, 0.25), rgba(255,255,255, 0.25) 2px, transparent 1px, transparent 6px)',
                    backgroundSize: '4px 4px'
                }}>
                    {/* Annoying viewbox tweak to align with drag bar*/}
                    <DisabledByDefaultSharp viewBox="1.5 1.5 19.5 19.5" onClick={() => props.setHidden(true)} color={'primary'}/>
                </div>
                <div style={{width: 'min-content', overflowY: 'scroll', padding: '8px', height: `${EXPLAINER_INNER_HEIGHT}px`, color: theme.palette.primary.main}}>
                    <Logo/> is a playground for WebGPU compute shaders. Everything here is written in WGSL, which is WebGPU&apos;s native shader language.
                    For up-to-date information on WGSL, please see the <a href="https://www.w3.org/TR/WGSL/">WGSL draft specification</a>.
                    You can also <a href="https://google.github.io/tour-of-wgsl/">take a tour of WGSL</a>.

                    <br/><br/>
                    <h1>Inputs</h1>
                    <Logo/> supplies keyboard input, mouse input, selectable input textures, custom values controlled by sliders, and the current frame and elapsed time.
                    <br/><br/>
                    Mouse input can be accessed from the <HiLite>mouse</HiLite> struct:
                    <pre style={{color: theme.palette.neutral.main}}>
                        mouse.pos: uint2<br/>
                        mouse.click: int
                    </pre>
                    Timing information is in the <HiLite>time</HiLite> struct:
                    <pre style={{color: theme.palette.neutral.main}}>
                        time.frame: uint<br/>
                        time.elapsed: float
                    </pre>
                    Custom uniforms are in the <HiLite>custom</HiLite> struct:
                    <pre style={{color: theme.palette.neutral.main}}>
                        custom.my_custom_uniform_0: float<br/>
                        custom.my_custom_uniform_1: float
                    </pre>
                    Two selectable textures can be accessed from <HiLite>channel0</HiLite> and <HiLite>channel1</HiLite>:
                    <pre style={{color: theme.palette.neutral.main}}>
                        textureSampleLevel(channel0, bilinear, uv, pass, lod)<br/>
                        textureSampleLevel(channel1, bilinear, uv, pass, lod)
                    </pre>
                    Keyboard input can be accessed from the provided <HiLite>keyDown(keycode: uint)</HiLite> helper function:
                    <pre style={{color: theme.palette.neutral.main}}>
                        keyDown(32u) // returns true when the spacebar is pressed
                    </pre>
                    <h1>Outputs</h1>
                    For compute shader input and output <Logo/> provides:<br/>
                    one input texture array <HiLite>pass_in</HiLite>,<br/>
                    one output storage texture array <HiLite>pass_out</HiLite>,<br/>
                    and one output screen storage texture <HiLite>screen</HiLite>.

                    <br/><br/>
                    The shader can write to <HiLite>pass_out</HiLite>, which will be copied into <HiLite>pass_in</HiLite> after the current entrypoint has returned.
                    <HiLite> pass_in</HiLite> will always contain whatever has been written to <HiLite>pass_out</HiLite> during all of the <em>previous</em> entrypoints.
                    The contents of <HiLite>pass_in</HiLite> will not change while an entrypoint is running.
                    <HiLite> pass_in</HiLite> and <HiLite>pass_out</HiLite> are both texture arrays with 4 texture layers.
                    For example, you can access the third layer of <HiLite>pass_in</HiLite> at LOD 0 and coordinate (1,1) by using the built-in helper function:<br/>
                    <pre style={{color: theme.palette.neutral.main}}>passLoad(2, int2(1,1), 0)</pre>

                    <h1>Preprocessor</h1>
                    <Logo/> also provides an experimental WGSL preprocessor. It currently allows the use of a handful of basic directives:
                    <ul>
                        <li><HiLite>#define NAME VALUE</HiLite> for simple macros (function-like parameter substitution is not yet supported)</li>
                        <li><HiLite>#include &quot;PATH&quot;</HiLite> for accessing built-in libraries</li>
                        <li><HiLite>#workgroup_count ENTRYPOINT X Y Z</HiLite> for specifying how many workgroups should be dispatched for an entrypoint</li>
                        <li><HiLite>#dispatch_count ENTRYPOINT N</HiLite> for dispatching an entrypoint multiple times in a row</li>
                        <li><HiLite>#storage NAME TYPE</HiLite> for declaring a storage buffer</li>
                    </ul>

                    <h1>Storage</h1>
                    Read-write storage buffers can be declared using the <HiLite>#storage</HiLite> directive. For example, you can create a buffer of atomic counters:
                    <pre style={{color: theme.palette.neutral.main}}>#storage atomic_storage array&lt;atomic&lt;i32&gt;&gt;</pre>
                    You could use WGSL&apos;s built-in functions to do atomic operations on this buffer in any order,
                    enabling you to safely perform work across many threads at once and accumulate the result in one place.
                    Note that any writes to read-write storage buffers are immediately visible to subsequent reads
                    (unlike the situation with <HiLite>pass_in</HiLite> and <HiLite>pass_out</HiLite>).

                    <br/><br/>
                    The final visual output of every shader is written to the <HiLite>screen</HiLite> storage texture, which displays the result in the canvas on this page.

                    <br/><br/>
                    Debugging assertions are supported with an <HiLite>assert</HiLite> helper function:
                    <pre style={{color: theme.palette.neutral.main}}>
                        assert(0, isfinite(col.x))<br/>
                        assert(1, isfinite(col.y))
                    </pre>

                    <h1>Examples</h1>

                    <div style={{fontWeight: "bold", fontSize: "0.8rem"}}>
                        <Link href={`https://compute.toys/view/77`}>Simple single pass shader</Link>
                        <br/><br/>
                        <Link href={`https://compute.toys/view/76`}>Preprocessor #include</Link>
                        <br/><br/>
                        <Link href={`https://compute.toys/view/59`}>Terminal overlay</Link>
                        <br/><br/>
                        <Link href={`https://compute.toys/view/76`}>Storage</Link>
                        <br/><br/>
                        <Link href={`https://compute.toys/view/48`}>Preprocessor #dispatch_count</Link>
                        <br/><br/>
                        <Link href={`https://compute.toys/view/47`}>Preprocessor #workgroup_count</Link>
                        <br/><br/>
                        <Link href={`https://compute.toys/view/17`}>Assert</Link>
                        <br/><br/>
                    </div>

                    <h1>Prelude</h1>

                    Every shader begins with a common <i>prelude</i>. The prelude contains the data inputs and outputs for this shader,
                    as well as a few helper functions and type definitions to make working with <Logo/> a more streamlined and familiar process.
                    Please refer to the prelude for a complete listing of the available data in your shader.
                    <br/><br/>
                    Here are the current contents of this shader&apos;s prelude:

                    <pre style={{color: theme.palette.neutral.main}}><Prelude/></pre>

                    <b>Note:</b> Matrix types in WGSL are stored in column-major order.
                    This means a matrix of type <HiLite>mat2x3<f32></HiLite> (aka <HiLite>mat2x3f</HiLite> or <HiLite>float2x3</HiLite>)
                    is constructed from 2 column vectors of type <HiLite>vec3<f32></HiLite> (aka <HiLite>vec3f</HiLite> or <HiLite>float3</HiLite>).
                    This is backward from HLSL and convention in mathematics.

                </div>

            </Item>
        </Draggable>
    );
}

export default function Explainer() {
    const [explainerHidden, setExplainerHidden] = useState(true);
    const theme = useTheme();

    return (
        <Fragment>
            <Button
                onClick={() => {
                    setExplainerHidden(!explainerHidden);
                }}
                sx={{color: theme.palette.dracula.foreground}}
            >
                <QuestionMarkIcon/>
            </Button>
            <DraggableExplainer hidden={explainerHidden} setHidden={setExplainerHidden}/>
        </Fragment>
    );
}
