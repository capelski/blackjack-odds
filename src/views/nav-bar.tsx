import React from 'react';
import { Link, Location, useLocation } from 'react-router-dom';
import { colors } from '../constants';
import { Paths } from '../models';

interface StyledLinkProps {
    location: Location;
    to: string;
}

const StyledLink: React.FC<StyledLinkProps> = (props) => {
    return (
        <Link
            style={{
                color: colors.link.default,
                fontWeight: props.location.pathname === props.to ? 'bold' : undefined,
                paddingRight: 16,
                textDecoration: props.location.pathname === props.to ? 'unset' : 'underline'
            }}
            to={props.to}
        >
            {props.children}
        </Link>
    );
};

export const NavBar: React.FC = () => {
    const location = useLocation();

    return (
        <nav>
            <StyledLink location={location} to={Paths.playerDecisions}>
                Player decisions
            </StyledLink>
            <StyledLink location={location} to={Paths.strategyAndRules}>
                Strategy/Rules
            </StyledLink>
        </nav>
    );
};
