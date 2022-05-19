import 'firacode'
import '@fontsource/lobster'
import FakeLink from "./fakelink";

export default function Logo(props) {
    return (
        <FakeLink href="/">
            <span style={{ color: 'white', fontFamily: 'Fira Code' }}>
                <span style={{ color: 'gray' }}>@</span>
                compute
            </span>
            <span style={{ fontFamily: 'Lobster', fontSize: '110%' }}>
                <span style={{ color: 'gray' }}>.</span>
                toys
            </span>
        </FakeLink>
    );
}