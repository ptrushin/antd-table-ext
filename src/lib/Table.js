import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Table as AntdTable } from 'antd';
import { Resizable } from "react-resizable";
import ReactDragListView from "react-drag-listview";
import TableColumnSettings from './TableColumnSettings';
import { getAllColumns, getColumnsHeadersCnt, getColumnsMap } from './columnUtils';
import { getInitialState, setStateToStorage, changeColumnState, columnsToState, stateToColumns, getColumnsDefaultState } from './tableStateUtils';
import { useHistory } from './useHistory';
import global from './global';
import excelExporter from './excelExporter';
import cloneDeep from 'clone-deep';
import './table.css';

let isShiftPressed = false;
window.addEventListener('keyup', (e) => isShiftPressed = e.shiftKey);
window.addEventListener('keydown', (e) => isShiftPressed = e.shiftKey);

export const globalColumnDefaults = {
    movable: true,
    resizable: true,
    hideable: true,
    fixable: true,
    sortable: false,
    filterable: false,
    ellipsis: true
}

const Table = ({
    forwardedRef,
    components,
    columns: propsColumns,
    defaults: propsDefaults = {},
    onColumnMoved,
    onColumnResized,
    onColumnHid,
    onColumnFixed,
    onColumnSorted,
    onColumnFiltered,
    onColumnChanged,
    onChange,
    onResetColumnSettings,
    stateStorable = true,
    history: propsHistory,
    locale: propsLocale = {},
    addLastColumn = true,
    fullscreen,
    dataSource,
    pagination,
    ...rest }) => {
    const locale = {...global.locale, ...propsLocale};
    const [tbodyTop, setTbodyTop] = useState();
    const [paddingBottom, setPaddingBottom] = useState();

    const wrapperRef = useCallback(node => {
        if (node !== null) {
            setTbodyTop(parseInt(node.querySelector('tbody').getBoundingClientRect().top));
            setPaddingBottom(parseInt(window.getComputedStyle(node.parentElement, null).getPropertyValue('padding-bottom')));
        }
    }, []);

    const columnDefaults = {
        ...globalColumnDefaults,
        ...propsDefaults
    }

    let topLevelColumns = cloneDeep(propsColumns)
    let allColumns = getAllColumns(topLevelColumns);
    const columnsMap = getColumnsMap(allColumns);

    const internalHistory = useHistory();
    const history = propsHistory || internalHistory;

    const [state, setState] = useState();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        setState(getInitialState(getAllColumns(cloneDeep(propsColumns)), stateStorable, history));
    }, [history, history.location]);

    useEffect(() => {
        if (!state) return;
        if (isInitialized) setStateToStorage(allColumns, stateStorable, state, history);
        else setIsInitialized(true);
    }, [state])

    const [tableColumnSettingsDialogState, setTableColumnSettingsDialogState] = useState({ visible: false });
    const internalRef = useRef();

    if (!isInitialized) return null;

    const getAble = (column, able) => {
        return rest[able] === false
            ? false
            : (column[able] === true || (columnDefaults && columnDefaults[able] && column[able] !== false)) === true;
    }

    const beforeStateToColumns = (columns) => {
        for (let column of columns) {
            if (!column.children) {
                if (getAble(column, 'sortable') || column.sorter || column.sortOrder || column.defaultSortOrder) {
                    column.sorter = column.sorter
                        ? { ...(typeof column.sorter === 'function' ? { compare: column.sorter } : column.sorter), multiple: column.sorter.multiple || 0 }
                        : { multiple: 0 };
                    column.sortable = true;
                }
                if (getAble(column, 'filterable') || column.filterDropdown || column.filteredValue || column.defaultfilteredValue || column.filters || column.onFilter) {
                    column.filterable = true;
                }
            }
            if (column.ellipsis === undefined && getAble(column, 'ellipsis')) column.ellipsis = true;
        }
        return columns;
    }

    const afterStateToColumns = (columns) => {
        for (let column of columns) {
            if (column.currentWidth) column.width = column.currentWidth;
            if (column.sortable) {
                let multiple = column.currentSortIndex || 0;
                if (!column.sorter) column.sorter = { multiple: multiple }
                else column.sorter.multiple = multiple;
            }
            column.fixed = column.currentFixed;
        }
        return columns;
    }

    allColumns = afterStateToColumns(stateToColumns(state, beforeStateToColumns(allColumns)));
    let columnHeadersCnt = getColumnsHeadersCnt(allColumns);
    const leafColumns = allColumns.filter(_ => !_.children);

    const columnMoved = ({ fromIndex, toIndex, level }) => {
        const columnReindex = (columns, fromIndex, notSorted) => {
            const sortedColumns = notSorted ? columns : columns.sort((a, b) => a.currentIndex - b.currentIndex);
            const firstIndex = notSorted ? 0 : parseInt(sortedColumns[0].currentIndex || 0);
            const delta = parseInt(fromIndex - firstIndex);
            let fi = 0;
            for (let index in sortedColumns) {
                let column = sortedColumns[index];
                column.currentIndex = parseInt(index) + delta;
                if (column.children) fi = columnReindex(column.children, fi, false)
            }
            return fromIndex + sortedColumns.length;
        }
        let delta = level === 0 ? ((rest.rowSelection ? 1 : 0) + (rest.expandable ? 1 : 0)) : 0;
        const sortedColumns = allColumns.filter(_ => _.level === level).sort((a, b) => a.currentIndex - b.currentIndex);
        const visibleColumns = sortedColumns.filter(_ => !_.currentHidden);
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
        columnsToState(setState, allColumns);
        if (onColumnMoved) onColumnMoved({ columnKey: from.key, toColumnKey: to.key });
        if (onColumnChanged) onColumnChanged({ action: 'moved', columnKey: from.key, toColumnKey: to.key })
    };

    const columnResized = ({ columnKey, width }) => {
        columnsMap[columnKey].width = Math.round(width);
        changeColumnState(setState, columnKey, 'currentWidth', Math.round(width))
        if (onColumnResized) onColumnResized({ columnKey, width });
        if (onColumnChanged) onColumnChanged({ action: 'resized', columnKey, width })
    };

    const columnInitWidth = ({ columnKey, width }) => {
        changeColumnState(setState, columnKey, 'currentWidth', Math.round(width))
    };

    const resetColumnSettings = () => {
        setState(getColumnsDefaultState(getAllColumns(cloneDeep(propsColumns))));
        setTableColumnSettingsDialogState({ visible: false });
        if (onResetColumnSettings) onResetColumnSettings();
    }

    const columnVisible = ({ columnKey, hidden }) => {
        columnsMap[columnKey].currentHidden = hidden;
        columnsToState(setState, allColumns)
        if (onColumnHid) onColumnHid({ columnKey, hidden });
        if (onColumnChanged) onColumnChanged({ action: 'visible', columnKey, hidden })
    };

    const columnFixed = ({ columnKey, fixed }) => {
        columnsMap[columnKey].currentFixed = fixed;
        columnsToState(setState, allColumns)
        if (onColumnFixed) onColumnFixed({ columnKey, fixed });
        if (onColumnChanged) onColumnChanged({ action: 'fixed', columnKey, fixed })
    };

    const change = (newPagination, filters, sorter, props) => {
        // sorter
        const prevOrderedColumns = leafColumns.filter(_ => _.sortOrder);
        const newOrderedColumns = (sorter ? (Array.isArray(sorter) ? sorter : [sorter]) : []).filter(_ => _.order);
        const newOrderedColumnsLength = newOrderedColumns.length;

        if (props.action === 'sort') {
            if (!isShiftPressed) {
                for (let c of prevOrderedColumns) {
                    delete columnsMap[c.key].currentSortIndex;
                    delete columnsMap[c.key].sortOrder;
                }
                if (newOrderedColumnsLength > 0) {
                    sorter = newOrderedColumns[newOrderedColumnsLength - 1]
                    columnsMap[sorter.columnKey].currentSortIndex = 1;
                    columnsMap[sorter.columnKey].sortOrder = sorter.order;
                }
            } else {
                if (prevOrderedColumns.length > newOrderedColumnsLength) {
                    const removeColumn = prevOrderedColumns.filter(c => !newOrderedColumns.find(nc => nc.columnKey === c.key))[0];
                    const currentSortIndex = removeColumn.currentSortIndex;
                    for (let c of prevOrderedColumns.filter(_ => _.currentSortIndex > currentSortIndex)) columnsMap[c.key].currentSortIndex--;
                    delete columnsMap[removeColumn.key].currentSortIndex;
                    delete columnsMap[removeColumn.key].sortOrder;
                } else if (newOrderedColumnsLength > 0) {
                    const last = leafColumns.filter(c => c.key === newOrderedColumns[newOrderedColumnsLength - 1].columnKey)[0];
                    const currentSortIndex = last.currentSortIndex;
                    if (currentSortIndex > 0) for (let c of prevOrderedColumns.filter(_ => _.currentSortIndex > currentSortIndex)) columnsMap[c.key].currentSortIndex--;
                    columnsMap[last.key].currentSortIndex = newOrderedColumnsLength;
                    columnsMap[last.key].sortOrder = newOrderedColumns[newOrderedColumnsLength - 1].order;
                }
            }
        }

        // filters
        if (props.action === 'filter') {
            for (let column of leafColumns) {
                const filter = !filters ? undefined : filters[column.key];
                if (column.filteredValue && !filter) delete column.filteredValue;
                else if (filter && column.filteredValue != filter) column.filteredValue = filter;
            }
        }

        columnsToState(setState, allColumns);
        if (onChange) onChange(newPagination, filters,
            !sorter || !Array.isArray(sorter)
                ? sorter
                : sorter.sort((a, b) => (columnsMap[a.columnKey].currentSortIndex || 0) - (columnsMap[b.columnKey].currentSortIndex || 0)),
            props);
    }

    let hasProcentColumns = addLastColumn && leafColumns.filter(_ => !_.currentHidden).some(_ => !_.width || (!Number.isInteger(_.width) && _.width.endsWith('%')));

    // Формируем колонки для antd table
    const prepareColumns = (columns, level) => {
        const sortedColumns = columns.sort((a, b) => a.currentIndex - b.currentIndex).filter(_ => !_.currentHidden);
        const tableColumns = [];

        for (let column of sortedColumns) {
            if (column.children) {
                column.children = prepareColumns(column.children, level + 1);
                if (column.children.length > 0) {
                    tableColumns.push(column);
                    const title = column.title;
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
            } else {
                tableColumns.push(column);
                column.onHeaderCell = (column) => ({
                    resizable: !column.children && getAble(column, 'resizable'),
                    width: column.width,
                    columnKey: column.key,
                    notPxWidthDelta: addLastColumn ? -1 : 0,
                    onResize: (e, { size }) => columnResized({ columnKey: column.key, width: size.width }),
                    onInitWidth: (width) => columnInitWidth({ columnKey: column.key, width }),
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
                // Добавляем номер сортировки и description
                const title = column.title;
                if (column.sortable) {
                    column.title = ({ sortColumns }) => {
                        let titleText = title instanceof Function ? title() : title;
                        return (
                            <div style={{
                                display: 'flex',
                                flex: 'auto',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                                className={`movable-level-${column.level}`}>
                                <span className='antd-ext-inner-title' title={column.description || titleText}>{titleText}</span>
                                {column.currentSortIndex > 0 && sortColumns && sortColumns.filter(_ => _.order).length > 1 && <span style={{ fontSize: 9, paddingTop: 0, verticalAlign: 'top' }}>{column.currentSortIndex}</span>}
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
            }
        }

        if (level === 0) {
            // специальная колонка, чтобы занять пустое место
            if (addLastColumn && !hasProcentColumns) tableColumns.push({ width: '100%' })
            // специальная колонка, чтобы не было сдвига!
            tableColumns.push({ width: 10 })
        }

        return tableColumns;
    }

    const ref = forwardedRef || internalRef;
    if (ref && ref.current) {
        // программно делаем scroll, иначе могут прыгать заголовоки относительно колонок
        /*const scroller = ref.current.querySelector('.ant-table-body');
        if (scroller) {
            scroller.scrollTop = scroller.scrollTop + 1;
            scroller.scrollTop = scroller.scrollTop - 1;
            */
    }

    let tableColumns = prepareColumns(cloneDeep(topLevelColumns), 0);

    const exportToExcel = () => {
        excelExporter(topLevelColumns, dataSource);
    }

    const getDeltaY = () => {
        const paginationHeight = (pagination === false ? 0 : (rest.size === 'small' ? 34 : rest.size === 'middle' ? 34 : 42));
        const bottomHeight = (fullscreen.deltaY || paddingBottom || 0);
        return tbodyTop + paginationHeight + bottomHeight;
    }

    return <div ref={wrapperRef}>
        <MultiHeaderMovableTitle columnMoved={columnMoved} levels={columnHeadersCnt}>
            <AntdTable
                columns={tableColumns}
                components={{
                    header: {
                        cell: ResizableTitle
                    },
                    ...components
                }}
                onChange={change}
                ref={ref}
                scroll={fullscreen ? { x: 100, y: `calc(100vh - ${getDeltaY()}px)` } : undefined}
                locale={locale}
                dataSource={dataSource}
                pagination={pagination}
                {...rest}
            />
            {tableColumnSettingsDialogState && <TableColumnSettings
                onColumnVisible={columnVisible}
                onColumnFixed={columnFixed}
                onResetColumnSettings={resetColumnSettings}
                columns={topLevelColumns}
                allColumns={allColumns}
                onClose={() => setTableColumnSettingsDialogState({ visible: false })}
                locale={locale}
                {...tableColumnSettingsDialogState}
                tableRef={ref}
                onExportToExcel={exportToExcel}
                />}
        </MultiHeaderMovableTitle>
    </div>
};

//Table.Summary = AntdTable.Summary;
//export default Table;
const exportTable = React.forwardRef((props, ref) => { return <Table {...props} forwardedRef={ref} />; });
exportTable.Summary = AntdTable.Summary;
exportTable.SELECTION_COLUMN = AntdTable.SELECTION_COLUMN;
exportTable.EXPAND_COLUMN = AntdTable.EXPAND_COLUMN;
exportTable.SELECTION_ALL = AntdTable.SELECTION_ALL;
exportTable.SELECTION_INVERT = AntdTable.SELECTION_INVERT;
exportTable.SELECTION_NONE = AntdTable.SELECTION_NONE;
exportTable.Column = AntdTable.Column;
exportTable.ColumnGroup = AntdTable.ColumnGroup;
export default exportTable;

const ResizableTitle = (props) => {
    const { onResize, onInitWidth, width, resizable, notPxWidthDelta, columnKey, ...restProps } = props;
    const ref = useRef();
    let ifWidthInPixels = width && (Number.isInteger(width) || width.endsWith('px'));
    useEffect(() => {
        if (resizable && !ifWidthInPixels && onInitWidth) {
            // -1 для колонки по умолчанию
            onInitWidth(ref.current.offsetWidth + (notPxWidthDelta || 0));
        }
        // eslint-disable-next-line
    }, [ifWidthInPixels, resizable]);

    if (!ifWidthInPixels || resizable === false)
        return <th ref={ref} width={width} {...restProps} />;

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
        enableScroll: true,
        key: level
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