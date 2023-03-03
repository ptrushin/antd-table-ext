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