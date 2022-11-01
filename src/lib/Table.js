import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Table as AntdTable } from 'antd';
import { Resizable } from "react-resizable";
import ReactDragListView from "react-drag-listview";
import TableColumnSettings from './TableColumnSettings';
import { getColumnKey, getAllInitializedColumns, getColumnsHeadersCnt, getColumnsMap } from './columnUtils';
import './table.css';

const cloneDeep = require('clone-deep');

const Table = (props) => {
    const { components, columns: propsColumns2, resizable = true, movable = true, hideable = true, onColumnMoved, onColumnResized, onColumnVisible, onColumnFixed, onColumnChange, onChange, onResetColumnSettings, ...rest } = props;

    const columnsMemoPrev = useMemo(() => ({
        prev: {}
    }), [])

    const columnsMemo = useMemo(() => {
        let allColumns = getAllInitializedColumns(propsColumns2);
        let columnHeadersCnt = getColumnsHeadersCnt(allColumns);
        for (let c of allColumns) {
            let cc = columnsMemoPrev.prev[c.key];
            if (cc) {
                c.index = cc.index;
                c.hidden = cc.hidden;
                c.width = cc.width;
                c.fixed = cc.fixed;
            }
        }
        columnsMemoPrev.prev = getColumnsMap(allColumns);
        return {
            allColumns,
            columnHeadersCnt,
            propsColumns: propsColumns2
        };
    }, [propsColumns2]);

    //const columnsMemoPrev = usePrevious(columnsMemo);

    const propsColumns = columnsMemo.propsColumns;
    const allColumns = columnsMemo.allColumns;
    const columnHeadersCnt = columnsMemo.columnHeadersCnt;
    const columns = allColumns.filter(_ => !_.children);

    const defaults = {
        resizable,
        movable,
        hideable
    }

    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [tableColumnSettingsDialogState, setTableColumnSettingsDialogState] = useState({ visible: false });
    const shiftKeyPressed = useMemo(() => ({ pressed: false }), []);

    const getAble = (column, able) => {
        return defaults[able] === false
            ? false
            : (column[able] === true || (defaults && defaults[able] && column[able] !== false)) === true;
    }

    const initColumns = () => {
        const columnsSortOrder = Object.assign({},
            ...columns.filter(_ => _.defaultSortOrder || _.sortOrder).sort((a, b) => (a.sorter || {}).multiple - (b.sorter || {}).multiple)
                .map((_, i) => ({ [getColumnKey(_)]: i + 1 })));
        for (let column of allColumns) {
            column.key = getColumnKey(column);
            if (column.key === undefined) continue;
            column.onHeaderCell = (column) => ({
                resizable: !column.children && getAble(column, 'resizable'),
                width: column.width,
                columnKey: column.key,
                onResize: (e, { size }) => columnResized({ columnKey: column.key, width: size.width }),
                onInitWidth: (width) => columnResized({ columnKey: column.key, width, init: true }),
                onContextMenu: event => {
                    event.preventDefault();
                    setTableColumnSettingsDialogState({
                        visible: true,
                        x: event.clientX,
                        y: event.clientY,
                        columnKey: column.key
                    });
                }
            });
            if (!column.children) {
                if (getAble(column, 'sortable')) {
                    column.sorter = column.sorter === undefined
                        ? { multiple: 0 }
                        : { ...column.sorter, multiple: columnsSortOrder[column.key] || 0 };
                }
            }
        }
    }

    initColumns();
    const columnsMap = getColumnsMap(allColumns);

    const columnMoved = ({ fromIndex, toIndex, level }) => {
        const columnReindex = (columns, fromIndex, notSorted) => {
            const sortedColumns = notSorted ? columns : columns.sort((a, b) => a.index - b.index);
            const firstIndex = notSorted ? 0 : parseInt(sortedColumns[0].index || 0);
            const delta = parseInt(fromIndex - firstIndex);
            let fi = 0;
            for (let index in sortedColumns) {
                let column = sortedColumns[index];
                column.index = parseInt(index) + delta;
                if (column.children) fi = columnReindex(column.children, fi, false)
            }
            return fromIndex + sortedColumns.length;
        }
        let delta = rest.rowSelection && level === 0 ? 1 : 0;
        const sortedColumns = allColumns.filter(_ => _.level === level).sort((a, b) => a.index - b.index);
        const visibleColumns = sortedColumns.filter(_ => !_.hidden);
        fromIndex = fromIndex - delta;
        toIndex = toIndex - delta;
        if (fromIndex < 0 || toIndex < 0) return;
        const from = visibleColumns[fromIndex];
        const to = visibleColumns[toIndex];
        if (!from || !to || from.parentKey !== to.parentKey || from.fixed || to.fixed || !getAble(from, 'movable')) return;
        const toFullIndex = sortedColumns.indexOf(to);
        sortedColumns.splice(sortedColumns.indexOf(from), 1);
        sortedColumns.splice(toFullIndex, 0, from);
        columnReindex(sortedColumns, 0, true);
        forceUpdate();
        if (onColumnMoved) onColumnMoved({ columnKey: from.key, toColumnKey: to.key });
        if (onColumnChange) onColumnChange({ action: 'moved', columnKey: from.key, toColumnKey: to.key })
    };

    const columnResized = ({ columnKey, width, init }) => {
        columnsMap[columnKey].width = Math.round(width);
        forceUpdate();
        if (!init) {
            if (onColumnResized) onColumnResized({ columnKey, width });
            if (onColumnChange) onColumnChange({ action: 'resized', columnKey, width })
        }
    };

    const columnVisible = ({ columnKey, hidden }) => {
        columnsMap[columnKey].hidden = hidden;
        forceUpdate();
        if (onColumnVisible) onColumnVisible({ columnKey, hidden });
        if (onColumnChange) onColumnChange({ action: 'visible', columnKey, hidden })
    };

    const columnFixed = ({ columnKey, fixed }) => {
        columnsMap[columnKey].fixed = fixed;
        forceUpdate();
        if (onColumnFixed) onColumnFixed({ columnKey, fixed });
        if (onColumnChange) onColumnChange({ action: 'fixed', columnKey, fixed })
    };

    const change = (newPagination, filters, sorter, props) => {
        // сортировка
        const prevOrderedColumns = columns.filter(_ => _.sorter && _.sorter.multiple > 0);
        const newOrderedColumns = (sorter ? (Array.isArray(sorter) ? sorter : [sorter]) : []).filter(_ => _.order);
        const newOrderedColumnsLength = newOrderedColumns.length;

        let shiftKey = shiftKeyPressed.pressed;

        if (!shiftKey) {
            for (let c of prevOrderedColumns) {
                columnsMap[c.key].sorter.multiple = 0;
                columnsMap[c.key].sortOrder = undefined;
            }
            if (newOrderedColumnsLength > 0) {
                sorter = newOrderedColumns[newOrderedColumnsLength - 1]
                columnsMap[sorter.columnKey].sorter.multiple = 1;
                columnsMap[sorter.columnKey].sortOrder = sorter.order;
            }
        } else {
            if (prevOrderedColumns.length > newOrderedColumnsLength) {
                const removeColumn = prevOrderedColumns.filter(c => !newOrderedColumns.find(nc => nc.columnKey === c.key))[0];
                const multiple = removeColumn.sorter.multiple;
                for (let c of prevOrderedColumns.filter(_ => _.sorter.multiple > multiple)) columnsMap[c.key].sorter.multiple--;
                columnsMap[removeColumn.key].sorter.multiple = 0;
                columnsMap[removeColumn.key].sortOrder = undefined;
            } else if (newOrderedColumnsLength > 0) {
                const last = columns.filter(c => c.key === newOrderedColumns[newOrderedColumnsLength - 1].columnKey)[0];
                const multiple = last.sorter.multiple;
                if (multiple > 0) for (let c of prevOrderedColumns.filter(_ => _.sorter.multiple > multiple)) columnsMap[c.key].sorter.multiple--;
                columnsMap[last.key].sorter.multiple = newOrderedColumnsLength;
                columnsMap[last.key].sortOrder = newOrderedColumns[newOrderedColumnsLength - 1].order;
            }
        }
        forceUpdate();
        if (onChange) onChange(newPagination, filters,
            !sorter || !Array.isArray(sorter)
                ? sorter
                : sorter.sort((a, b) => (columnsMap[a.columnKey].sorter.multiple || 0) - (columnsMap[b.columnKey].sorter.multiple || 0)),
            props);
    }

    const prepareColumns = (columns, level) => {
        const newColumns = columns;
        const sortedColumns = newColumns.sort((a, b) => a.index - b.index).filter(_ => !_.hidden);
        const tableColumns = [];
        // Добавляем номер сортировки
        for (let i in sortedColumns) {
            let column = sortedColumns[i];
            /*if (!column.children && level < maxLevel) {
                let newColumn = {};
                newColumn.children = prepareColumns([column], level + 1);
                if (newColumn.children.length > 0) tableColumns.push(newColumn);
                continue;
            }*/
            let title = column.title;
            if (column.sorter) {
                column.title = ({ sortColumns }) => {
                    let titleText = title instanceof Function ? title() : title;
                    return (
                        <div style={{
                            display: 'flex',
                            flex: 'auto',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                            className={`movable-level-${column.level}`}
                            onClick={event => {
                                shiftKeyPressed.pressed = event.shiftKey
                            }}>
                            <span className='antd-ext-inner-title' title={column.description || titleText}>{titleText}</span>
                            {column.sorter.multiple > 0 && sortColumns && sortColumns.filter(_ => _.order).length > 1 && <span style={{ fontSize: 9, paddingTop: 0, verticalAlign: 'top' }}>{column.sorter.multiple}</span>}
                        </div>
                    )
                }
            } else {
                let titleText = title instanceof Function ? title() : title;
                column.title = ({ sortColumns }) => {
                    return (
                        <div style={{
                            display: 'flex',
                            flex: 'auto',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }} className={`movable-level-${column.level}`}><span className='antd-ext-inner-title' title={column.description || titleText}>{titleText}</span></div>
                    )
                }
            }
            if (column.children) {
                column.children = prepareColumns(column.children, level + 1);
                if (column.children.length > 0) tableColumns.push(column);
            } else {
                tableColumns.push(column);
            }
        }
        
        if (level === 0) {
            // специальная колонка, чтобы занять пустое место
            tableColumns.push({ width: '100%' })
            // специальная колонка, чтобы не было сдвига!
            tableColumns.push({ width: 10 })
        }
        return tableColumns;
    }

    let tableColumns = cloneDeep(propsColumns);
    tableColumns = prepareColumns(tableColumns, 0);

    return <div style={{ width: '100%' }}>
        <MultiHeaderMovableTitle columnMoved={columnMoved} levels={columnHeadersCnt}>
            <AntdTable
                bordered={true}
                size1='small'
                columns={tableColumns}
                components={{
                    header: {
                        cell: ResizableTitle
                    },
                    ...components
                }}
                onChange={change}
                scroll={{
                    y: true
                }}
                {...rest}
            />
            <TableColumnSettings
                onColumnVisible={columnVisible}
                onColumnFixed={columnFixed}
                onResetColumnSettings={onResetColumnSettings}
                columns={propsColumns}
                allColumns={allColumns}
                onClose={() => setTableColumnSettingsDialogState({ visible: false })}
                {...tableColumnSettingsDialogState} />
        </MultiHeaderMovableTitle>
    </div>
};

export default Table;

const ResizableTitle = (props) => {
    const { onResize, onInitWidth, width, resizable, columnKey, ...restProps } = props;
    const ref = useRef();
    useEffect(() => {
        if (!width && onInitWidth) {
            onInitWidth(ref.current.offsetWidth);
        }
        // eslint-disable-next-line
    }, [width]);

    if (!width || resizable === false)
        return <th ref={ref} {...restProps} />;

    return (
        <Resizable
            width={width}
            height={30}
            handle={
                <span
                    className="react-resizable-handle"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
            }
            onResize={onResize}
            draggableOpts={{ enableUserSelectHack: false }}
        >
            <th ref={ref} {...restProps} />
        </Resizable>
    );
};

const MovableTitle = ({ children, columnMoved, level }) => {
    const dragProps = {
        onDragEnd(fromIndex, toIndex) {
            columnMoved({ fromIndex, toIndex, level });
        },
        nodeSelector: "th",
        handleSelector: `.movable-level-${level}`,
        ignoreSelector: "react-resizable-handle",
        lineClassName: "ReactDragListView-line",
        enableScroll: true
    };
    return <ReactDragListView.DragColumn {...dragProps}>
        {children}
    </ReactDragListView.DragColumn>
}

const MultiHeaderMovableTitle = ({ children, columnMoved, levels }) => {
    let component = children;
    for (let level = 0; level < levels; level++) {
        component = <MovableTitle columnMoved={columnMoved} level={level}>{component}</MovableTitle>
    }
    return component;
}