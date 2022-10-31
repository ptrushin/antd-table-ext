let columnIndex = 0;

export const getColumnKey = (column) => {
    if (column.key) return column.key;
    if (column.dataIndex) return Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
    return `column_${columnIndex++}`;
}

const getAllColumnsIterative = (column, level, parent) => {
    column.key = getColumnKey(column);
    if (parent !== null) column.parentKey = parent.key;
    let columns = [column]
    column.level = level;
    if (!column.children) return [column];
    for (let c of column.children) {
        columns = [...columns, ...getAllColumnsIterative(c, level + 1, column)];
    }
    return columns;
}

export const getAllInitializedColumns = (columns) => {
    let allColumns = [];
    for (let column of columns) {
        allColumns = [...allColumns, ...getAllColumnsIterative(column, 0, null)];
    }
    return allColumns;
}

export const getColumnsHeadersCnt = (columns) => {
    let headers = 1;
    for (let column of columns) {
        if (column.level + 1 > headers) headers = column.level + 1;
    }
    return headers;
}

export const getColumnsMap = (columns) => {
    return Object.assign({}, ...columns.map(_ => ({ [_.key]: _ })));
}