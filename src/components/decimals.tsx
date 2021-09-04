import React from 'react';

interface DecimalsProps {
    onChange: (decimals: number) => void;
    selectedValue: number;
}

export const Decimals: React.FC<DecimalsProps> = (props) => {
    return (
        <div>
            Decimals:{' '}
            <select
                onChange={(event) => {
                    props.onChange(parseInt(event.target.value));
                }}
                value={props.selectedValue}
            >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
            </select>
        </div>
    );
};
