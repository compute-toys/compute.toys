import Link from 'next/link';
import styled from "@emotion/styled";
import {MouseEventHandler, ReactNode} from "react";

const StyledA = styled.a`
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 10;
    opacity: 0;
    &:hover {
        cursor: pointer;
    }`;

const StyledDiv = styled.div`
    &:hover {
      cursor: pointer;
    }
    position: relative;
    display: inline-block;
    text-decoration: ${props => props.style.textDecoration ?? 'none'};
    color: ${props => props.color ?? 'inherit'};
`;

interface FakeLinkProps {
    href?: string,
    onClick?: MouseEventHandler,
    children?: ReactNode,
    textDecoration?: string,
    color?: string
}


export default function FakeLink(props: FakeLinkProps) {
    const anchor = props.onClick ?
        <StyledA onClick={props.onClick}/>
        :
        <StyledA/>;

    return (
            props.href ?
                <Link href={props.href} passHref>
                    <StyledDiv color={props.color ?? null} style={{textDecoration: props.textDecoration ?? null}}>
                        {anchor}
                        {props.children}
                    </StyledDiv>
                </Link>
                :
                <StyledDiv color={props.color ?? null} style={{textDecoration: props.textDecoration ?? null}}>
                    {anchor}
                    {props.children}
                </StyledDiv>
    );
}