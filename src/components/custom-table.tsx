import React, { CSSProperties } from 'react';
import { Column, Row, useTable } from 'react-table';

interface CustomTableProps<T extends {}> {
    columns: Column<T>[];
    data: T[];
    rowStyle?: (row: Row<T>) => CSSProperties | undefined;
}

export const CustomTable = <T extends {}>(props: CustomTableProps<T>) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
        columns: props.columns,
        data: props.data
    });

    return (
        <table {...getTableProps()}>
            <thead>
                {headerGroups.map((headerGroup, headerIndex) => (
                    <tr {...headerGroup.getHeaderGroupProps()} key={`header-row-${headerIndex}`}>
                        {headerGroup.headers.map((column) => (
                            <th
                                {...column.getHeaderProps()}
                                style={{
                                    border: '1px solid black',
                                    fontWeight: 'bold',
                                    paddingLeft: 4,
                                    paddingRight: 4
                                }}
                                key={column.id}
                            >
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                    prepareRow(row);
                    return (
                        <tr style={props.rowStyle && props.rowStyle(row)} {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                                return (
                                    <td
                                        {...cell.getCellProps()}
                                        style={{
                                            padding: 4,
                                            paddingBottom: 8,
                                            paddingTop: 8
                                        }}
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
