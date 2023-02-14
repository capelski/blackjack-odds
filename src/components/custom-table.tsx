import React, { CSSProperties, useMemo } from 'react';
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
    cellStyle?: (cell: CustomCell<TData, TColumn>) => CSSProperties | undefined;
    columns: TColumn[];
    data: TData[];
    width?: string | number;
}

const baseCellProps: CSSProperties = {
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    textAlign: 'center'
};

export const CustomTable = <TData extends {}, TColumn extends Column<TData>>(
    props: CustomTableProps<TData, TColumn>
) => {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = customUseTable({
        columns: props.columns,
        data: props.data
    });

    const { headers, data } = useMemo(() => {
        const headers = headerGroups.map((headerGroup) => {
            return {
                cells: headerGroup.headers.map((column) => {
                    const headerProps = column.getHeaderProps();
                    return (
                        <th
                            {...column.getHeaderProps()}
                            style={{
                                ...headerProps.style,
                                ...baseCellProps,
                                fontWeight: 'bold',
                                padding: '2px 4px'
                            }}
                            key={column.id}
                        >
                            {column.render('Header')}
                        </th>
                    );
                }),
                rowProps: headerGroup.getHeaderGroupProps()
            };
        });

        const data = rows.map((row) => {
            prepareRow(row);
            return {
                cells: row.cells.map((cell) => {
                    const cellProps = cell.getCellProps();
                    const columnStyle: CSSProperties = {
                        ...cellProps.style,
                        ...baseCellProps,
                        padding: 0,
                        ...(props.cellStyle ? props.cellStyle(cell) : {})
                    };

                    return (
                        <td {...cellProps} style={columnStyle} key={row.id + '-' + cell.column.id}>
                            {cell.render('Cell')}
                        </td>
                    );
                }),
                rowProps: row.getRowProps()
            };
        });

        return { headers, data };
    }, [headerGroups, rows]);

    return (
        <table width={props.width} {...getTableProps()}>
            {headers.length > 0 && (
                <thead>
                    {headers.map((headerGroup, headerIndex) => (
                        <tr {...headerGroup.rowProps} key={`header-row-${headerIndex}`}>
                            {headerGroup.cells}
                        </tr>
                    ))}
                </thead>
            )}
            <tbody {...getTableBodyProps()}>
                {data.map((row, rowIndex) => {
                    return (
                        <tr {...row.rowProps} key={`row-${rowIndex}`}>
                            {row.cells}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};
