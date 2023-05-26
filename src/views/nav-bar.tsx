import React, { CSSProperties, useState } from 'react';
import Modal from 'react-modal';
import { Link, useLocation } from 'react-router-dom';
import { Paths } from '../models';
import { getPlayerDecisionDealerCardPath, getPlayerDecisionScorePath } from '../logic';
import { routeCodeToDisplayCode } from '../logic/paths';
import { colors } from '../constants';

export const BreadcrumbSeparator: React.FC = () => (
    <span style={{ paddingLeft: 8, paddingRight: 8 }}>{'>'}</span>
);

interface BreadcrumbSectionProps {
    hideSeparator?: boolean;
    pathname: string;
    text: string;
    to: string;
}

const breadcrumbStyles: CSSProperties = {
    color: colors.link.default,
    fontSize: 18,
    textDecoration: 'none'
};

export const BreadcrumbSection: React.FC<BreadcrumbSectionProps> = (props) => {
    return (
        <React.Fragment>
            {!props.hideSeparator && <BreadcrumbSeparator />}
            <Link
                style={{
                    ...breadcrumbStyles,
                    fontWeight: props.pathname === props.to ? 'bold' : undefined
                }}
                to={props.to}
            >
                {props.text}
            </Link>
        </React.Fragment>
    );
};

export const NavBar: React.FC = (props) => {
    const { pathname } = useLocation();

    const [, , score, dealerCard] = pathname.split('/');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    return (
        <nav
            style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 16,
                marginBottom: 16
            }}
        >
            <div>
                <BreadcrumbSection
                    hideSeparator={true}
                    pathname={pathname}
                    text="Player decisions"
                    to={Paths.playerDecisions}
                />
                {score && (
                    <BreadcrumbSection
                        pathname={pathname}
                        text={routeCodeToDisplayCode(score)!}
                        to={getPlayerDecisionScorePath(score)}
                    />
                )}
                {dealerCard && (
                    <BreadcrumbSection
                        pathname={pathname}
                        text={dealerCard}
                        to={getPlayerDecisionDealerCardPath(score, dealerCard)}
                    />
                )}
            </div>
            <div>
                <span
                    style={{ ...breadcrumbStyles, cursor: 'pointer', fontSize: 24 }}
                    onClick={toggleModal}
                >
                    ⚙️
                </span>
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={toggleModal}
                    style={{ content: { inset: 0 } }}
                >
                    <div style={{ display: 'flex', fontSize: 20, justifyContent: 'end' }}>
                        <span onClick={toggleModal} style={{ cursor: 'pointer' }}>
                            ✖️
                        </span>
                    </div>
                    {props.children}
                </Modal>
            </div>
        </nav>
    );
};
