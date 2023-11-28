export const getColumnKey = (column, level, parent, index) => {
  if (column.key) return column.key;
  if (column.dataIndex) return Array.isArray(column.dataIndex) ? column.dataIndex.join('.') : column.dataIndex;
  return `${parent ? parent.key : ''}_${index || 0}`;
};
const getAllColumnsIterative = (column, level, parent, index) => {
  column.key = getColumnKey(column, level, parent, index);
  if (parent !== null) column.parentKey = parent.key;
  let columns = [column];
  column.level = level;
  if (!column.children) return [column];
  let i = 0;
  for (let c of column.children) {
    columns = [...columns, ...getAllColumnsIterative(c, level + 1, column, i++)];
  }
  return columns;
};
export const getAllColumns = columns => {
  let allColumns = [];
  let i = 0;
  for (let column of columns) {
    allColumns = [...allColumns, ...getAllColumnsIterative(column, 0, null, i++)];
  }
  return allColumns;
};
export const getColumnsHeadersCnt = columns => {
  let headers = 1;
  for (let column of columns) {
    if (column.level + 1 > headers) headers = column.level + 1;
  }
  return headers;
};
export const getColumnsMap = columns => {
  return Object.assign({}, ...columns.map(_ => ({
    [_.key]: _
  })));
};
export const getColumnsSortIndexMap = columns => {
  return Object.assign({}, ...columns.filter(_ => _.defaultSortOrder || _.sortOrder).sort((a, b) => (a.sorter || {}).multiple - (b.sorter || {}).multiple).map((_, i) => ({
    [_.key]: i + 1
  })));
};
export const getColumnsTreeData = (columns, onlyVisible = false, toExcel = false) => {
  const getNodes = columns => {
    let nodes = [];
    for (let column of columns.sort((a, b) => a.currentIndex - b.currentIndex)) {
      if (onlyVisible && column.currentHidden) continue;
      if (toExcel && column.renderToExcel === false) continue;
      let node = {
        ...column
      };
      if (column.children) {
        node.children = getNodes(column.children);
      }
      nodes.push(node);
    }
    return nodes;
  };
  return getNodes(columns);
};
export const getTreeLeafColumns = treeColumns => {
  let columns = [];
  for (let column of treeColumns) {
    if (!column.children || column.children.length === 0) columns.push(column);else columns = [...columns, ...getTreeLeafColumns(column.children)];
  }
  return columns;
};
export function getRecordValue(record, dataIndex) {
  const getValue = (record, dataIndexArr, level = 0) => {
    return level === dataIndexArr.length ? record : getValue(record[dataIndexArr[level]], dataIndexArr, level + 1);
  };
  if (!record) return record;
  const index = Array.isArray(dataIndex) ? dataIndex : dataIndex.split('.');
  return getValue(record, index, 0);
}