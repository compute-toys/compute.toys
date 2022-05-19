import 'firacode'
import '@fontsource/lobster'
import Link from 'next/link';
import styled from "@emotion/styled";

const StyledA = styled.a`
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    textDecoration: none;
    zIndex: 10;
    opacity: 0;
    &:hover {
        cursor: pointer;
    }`;

const StyledDiv = styled.div`
    &:hover {
      cursor: pointer;
    }
    position: relative
`;


export default function Logo(props) {
    return (
        <Link href="/">
            <StyledDiv>
                <StyledA></StyledA>
                <span style={{ color: 'white', fontFamily: 'Fira Code' }}>
                    <span style={{ color: 'gray' }}>@</span>
                    compute
                </span>
                <span style={{ fontFamily: 'Lobster', fontSize: '110%' }}>
                    <span style={{ color: 'gray' }}>.</span>
                    toys
                </span>

            </StyledDiv>
        </Link>
    );
}