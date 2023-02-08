import React, { CSSProperties } from 'react';
import { Cell, Column, Row, TableInstance, TableOptions, useTable } from 'react-table';

export type CustomCell<TData extends {}, TColumn extends Column<TData>> = Omit<
    Cell<TData>,
    'column'
> & {
    column: TColumn;
};

export type CustomColumn<TData extends object, TAdditionalProps extends object> = Column<TData> &
    TAdditionalProps;

export type CustomRow<TData extends {}, TColumn extends Column<TData>> = Omit<
    Omit<Row<TData>, 'cells'>,
    'column'
> & {
    cells: CustomCell<TData, TColumn>[];
    column: TColumn;
};

export type CustomTableInstance<TData extends {}, TColumn extends Column<TData>> = Omit<
    Omit<TableInstance, 'prepareRow'>,
    'rows'
> & {
    prepareRow: (row: CustomRow<TData, TColumn>) => void;
    rows: CustomRow<TData, TColumn>[];
};

export type CustomTableOptions<TData extends {}, TColumn extends Column<TData>> = Omit<
    TableOptions<TData>,
    'columns'
> & {
    columns: TColumn[];
};

function customUseTable<TData extends {}, TColumn extends Column<TData>>(
    options: CustomTableOptions<TData, TColumn>
) {
    return useTable(options as TableOptions<TData>) as unknown as CustomTableInstance<
        TData,
        TColumn
    >;
}

interface CustomTableProps<TData extends {}, TColumn extends Column<TData>> {
    columns: TColumn[];
    columnStyle?: (cell: CustomCell<TData, TColumn>) => CSSProperties | undefined;
    data: TData[];
    rowStyle?: (row: CustomRow<TData, TColumn>) => CSSProperties | undefined;
    width?: string | number;
}

export const CustomTable = <TData extends {}, TColumn extends Column<TData>>(
    props: CustomTableProps<TData, TColumn>
) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = customUseTable({
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
