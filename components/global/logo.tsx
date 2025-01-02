import '@fontsource/lobster/index.css';
import 'firacode/distr/fira_code.css';

export default function Logo() {
    return (
        <>
            <span style={{ color: 'white', fontFamily: 'Fira Code' }}>
                <span style={{ color: 'gray' }}>@</span>
                compute
            </span>
            <span style={{ color: 'white', fontFamily: 'Lobster', fontSize: '110%' }}>
                <span style={{ color: 'gray' }}>.</span>
                toys
            </span>
        </>
    );
}
