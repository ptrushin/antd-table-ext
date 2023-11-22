import { getColumnsSortIndexMap } from "./columnUtils";
import { getLocationPars, updateLocationsPars } from './locationUtils';
import equal from 'fast-deep-equal';
const nullValue = 'null';
const getLocalStorageKey = prefix => `_ps_${window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`}${prefix ? `_${prefix}` : ''}`;
const getPrefixedkey = (key, prefix) => `${prefix ? `${prefix}_` : ''}${key}`;
export const getStateFromStorage = (columns, stateStorable, history) => {
  if (!stateStorable) return undefined;
  const prefix = stateStorable.prefix || '';
  let state = undefined;
  if (stateStorable.localStorage !== false) {
    const localStorageKey = getLocalStorageKey(prefix);
    const item = localStorage.getItem(localStorageKey);
    state = item ? JSON.parse(item) : undefined;
  }
  if (stateStorable.location !== false && history) {
    if (!state) state = {
      columns: {}
    };
    const locationPars = getLocationPars(history);
    const sortName = getPrefixedkey('sort', prefix);
    const sortValue = locationPars.get(sortName);
    if (sortValue) {
      let i = 0;
      for (let kv of sortValue.split(',').map(_ => _.split(' '))) {
        if (!state.columns[kv[0]]) state.columns[kv[0]] = {};
        if (kv[1] === nullValue) {
          state.columns[kv[0]].sortOrder = null;
          state.columns[kv[0]].currentSortIndex = null;
        } else {
          state.columns[kv[0]].sortOrder = kv[1];
          state.columns[kv[0]].currentSortIndex = ++i;
        }
      }
    }
    for (const column of columns) {
      const filterName = getPrefixedkey(column.key, prefix);
      const stringFilterValue = locationPars.get(filterName);
      const filterValue = stringFilterValue === null || stringFilterValue === undefined ? null : stringFilterValue === nullValue ? nullValue : column.filterDeserialize ? column.filterDeserialize(stringFilterValue) : JSON.parse(stringFilterValue);
      if (filterValue !== null && filterValue !== undefined) {
        if (!state.columns[column.key]) state.columns[column.key] = {};
        state.columns[column.key].filteredValue = filterValue === nullValue ? null : filterValue;
      }
    }
  }
  return state;
};
export const setStateToStorage = (columns, stateStorable, state, history) => {
  if (!stateStorable) return;
  const prefix = stateStorable.prefix || '';
  if (stateStorable.localStorage !== false) {
    const localStorageKey = getLocalStorageKey(prefix);
    if (!state) localStorage.removeItem(localStorageKey);else {
      let _state = {
        columns: {}
      };
      for (let key in state.columns) {
        const column = state.columns[key];
        _state.columns[key] = {
          currentIndex: column.currentIndex,
          currentFixed: column.currentFixed,
          currentHidden: column.currentHidden,
          currentWidth: column.currentWidth
        };
      }
      localStorage.setItem(localStorageKey, JSON.stringify(_state));
    }
  }
  if (stateStorable.location !== false || !history) {
    const sortName = getPrefixedkey('sort', prefix);
    let pars = {
      [sortName]: null
    };
    for (let column of columns.filter(_ => _.filterable)) {
      pars[getPrefixedkey(column.key, prefix)] = null;
    }
    if (state && state.columns) {
      let sortValue = null;
      const sortColumns = Object.entries(state.columns).filter(_ => _[1].sortOrder || _[1].sortOrder != _[1].column.defaultSortOrder);
      if (sortColumns.length > 0) {
        // если только дефолтные сортировки, то не выводим
        if (stateStorable.storeDefault || sortColumns.some(_ => _[1].sortOrder != _[1].column.defaultSortOrder)) {
          sortValue = sortColumns.sort((a, b) => {
            // null in the end
            if (!a[1].sortOrder && !b[1].sortOrder) return a[1].column.key.localeCompare(b[1].column.key);
            if (!a[1].sortOrder) return 1;
            if (!b[1].sortOrder) return -1;
            return Math.sign(a[1].currentSortIndex - b[1].currentSortIndex);
          }).map(_ => `${_[0]} ${_[1].sortOrder ? _[1].sortOrder : nullValue}`).join(',');
        }
      }
      pars[sortName] = sortValue || null;
      for (let kv of Object.entries(state.columns).filter(_ => _[1].filteredValue || _[1].filteredValue != _[1].column.defaultFilteredValue).sort((a, b) => a[1].column.key.localeCompare(b[1].column.key))) {
        let column = kv[1];
        if (stateStorable.storeDefault || column.column.defaultFilteredValue && column.filteredValue) {
          if (equal(column.column.defaultFilteredValue, column.filteredValue)) continue;
        }
        const filterValue = !column.filteredValue ? nullValue : column.column.filterSerialize ? column.column.filterSerialize(column.filteredValue) : JSON.stringify(column.filteredValue);
        pars[getPrefixedkey(kv[0], prefix)] = filterValue;
      }
    }
    updateLocationsPars(history, pars);
  }
};
export const changeColumnState = (setState, columnKey, propertyKey, propertyValue) => {
  setState(state => {
    let _state = !state ? {
      columns: {}
    } : {
      ...state
    };
    if (!_state.columns[columnKey]) _state.columns[columnKey] = {};
    _state.columns[columnKey][propertyKey] = propertyValue;
    return _state;
  });
};
export const getColumnsDefaultState = columns => {
  let state = {
    columns: {}
  };
  let sortIndexMap = getColumnsSortIndexMap(columns);
  for (let column of columns) {
    let stateColumn = {
      column: column
    };
    let sortIndex = sortIndexMap[column.key];
    if (sortIndex) {
      stateColumn.currentSortIndex = sortIndex;
      stateColumn.sortOrder = column.sortOrder || column.defaultSortOrder || null;
    }
    stateColumn.filteredValue = column.filteredValue || column.defaultFilteredValue || null;
    stateColumn.currentFixed = column.fixed;
    stateColumn.currentHidden = column.defaultHidden;
    state.columns[column.key] = stateColumn;
  }
  return state;
};
export const columnsToState = (setState, columns) => {
  setState(state => {
    let _state = !state ? {
      columns: {}
    } : {
      ...state
    };
    for (let column of columns) {
      if (!_state.columns[column.key]) _state.columns[column.key] = {};
      let stateColumn = _state.columns[column.key];
      stateColumn.currentIndex = column.currentIndex;
      stateColumn.sortOrder = column.sortOrder;
      stateColumn.currentSortIndex = column.currentSortIndex;
      stateColumn.filteredValue = column.filteredValue;
      stateColumn.currentHidden = column.currentHidden;
      stateColumn.currentFixed = column.currentFixed;
    }
    return _state;
  });
};
export const stateToColumns = (state, columns) => {
  if (!columns) return columns;
  for (let column of columns) {
    const stateColumn = state && state.columns ? state.columns[column.key] : undefined;
    if (stateColumn) {
      if (column.currentWidth === undefined && stateColumn.currentWidth !== undefined) column.currentWidth = stateColumn.currentWidth;
      if (column.currentHidden === undefined && stateColumn.currentHidden !== undefined) column.currentHidden = stateColumn.currentHidden;
      if (column.currentIndex === undefined && stateColumn.currentIndex !== undefined) column.currentIndex = stateColumn.currentIndex;
      if (column.currentFixed === undefined) column.currentFixed = stateColumn.currentFixed;
      if (column.currentSortIndex === undefined && stateColumn.currentSortIndex) column.currentSortIndex = stateColumn.currentSortIndex;
    }
    if (column.sortOrder === undefined && column.sortable) {
      column.sortOrder = stateColumn && stateColumn.sortOrder ? stateColumn.sortOrder : null;
    }
    if (column.filteredValue === undefined && column.filterable) {
      column.filteredValue = stateColumn && stateColumn.filteredValue ? stateColumn.filteredValue : null;
    }
  }
  return columns;
};
export const getInitialState = (columns, stateStorable, history) => {
  const columnsDefaultState = getColumnsDefaultState(columns);
  const stateFromStorage = getStateFromStorage(columns, stateStorable, history);
  if (!stateFromStorage) return columnsDefaultState;
  for (let column of columns) {
    let columnFromStorage = stateFromStorage.columns[column.key];
    if (columnFromStorage) columnsDefaultState.columns[column.key] = {
      ...columnsDefaultState.columns[column.key],
      ...columnFromStorage
    };
  }
  // reindex currentSortIndex
  let i = 0;
  for (let kv of Object.entries(columnsDefaultState.columns).filter(_ => _[1].currentSortIndex).sort((a, b) => {
    if (stateFromStorage.columns[a[0]] && !stateFromStorage.columns[b[0]]) return -1;else if (!stateFromStorage.columns[a[0]] && stateFromStorage.columns[b[0]]) return 1;else return Math.sign(a[1].currentSortIndex - b[1].currentSortIndex);
  })) {
    columnsDefaultState.columns[kv[0]].currentSortIndex = ++i;
  }
  return columnsDefaultState;
};