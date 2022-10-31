import React from 'react';
import Basic from './examples/basic';
import RowSelection from './examples/row-selection';
import RowSelectionAndOperation from './examples/row-selection-and-operation';
import RowSelectionCustom from './examples/row-selection-custom';
import FilterAndSorter from './examples/filter-and-sorter';
import MultipleSorter from './examples/multiple-sorter';
import ResetFilterAndSorter from './examples/reset-filter-and-sorter';
import CustomizedFilterPanel from './examples/customized-filter-panel';
import GroupingTableHead from './examples/grouping-table-head';

import 'antd/dist/antd.min.css';

function App() {
  return <div style={{padding: 20}}>
    Basic:<br/><Basic />
    <br/>
    RowSelection: <RowSelection />
    <br/>
    RowSelectionAndOperation:<br/><RowSelectionAndOperation />
    <br/>
    RowSelectionCustom:<br/><RowSelectionCustom />
    <br/>
    FilterAndSorter:<br/><FilterAndSorter />
    <br/>
    MultipleSorter:<br/><MultipleSorter />
    <br/>
    ResetFilterAndSorter:<br/><ResetFilterAndSorter />
    <br/>
    CustomizedFilterPanel:<br/><CustomizedFilterPanel />
    <br/>
    GroupingTableHead:<br/><GroupingTableHead />
  </div>
}

export default App;
