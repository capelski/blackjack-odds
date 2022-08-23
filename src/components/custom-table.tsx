import React, { CSSProperties } from 'react';
import { Cell, Column, Row, useTable } from 'react-table';

interface CustomTableProps<T extends {}> {
    columns: Column<T>[];
    columnStyle?: (cell: Cell<T>) => CSSProperties | undefined;
    data: T[];
    rowStyle?: (row: Row<T>) => CSSProperties | undefined;
    width?: string | number;
}

export const CustomTable = <T extends {}>(props: CustomTableProps<T>) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
        columns: props.columns,
        data: props.data
    });

    return (
        <table width={props.width} {...getTableProps()}>
            <thead>
                {headerGroups.map((headerGroup, headerIndex) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={`header-row-${headerIndex}`}>
                        {headerGroup.headers.map((column) => {
                            const headerProps = column.getHeaderProps();
                            return (
                                <th
                                    {...column.getHeaderProps()}
                                    style={{
                                        ...headerProps.style,
                                        border: '1px solid black',
                                        fontWeight: 'bold',
                                        padding: '2px 4px'
                                    }}
                                    key={column.id}
                                >
                                    {column.render('Header')}
                                </th>
                            );
                        })}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    return (
                        <tr style={props.rowStyle && props.rowStyle(row)} {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                                const cellProps = cell.getCellProps();
                                const columnStyle: CSSProperties = {
                                    ...cellProps.style,
                                    padding: '8px 4px',
                                    textAlign: 'center',
                                    ...(props.columnStyle ? props.columnStyle(cell) : {})
                                };

                                return (
                                    <td
                                        {...cellProps}
                                        style={columnStyle}
                                        key={row.id + '-' + cell.column.id}
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};
