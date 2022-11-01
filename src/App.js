import React from 'react';
import Basic from './examples/Basic';
import RowSelection from './examples/RowSelection';
import RowSelectionAndOperation from './examples/RowSelectionAndOperation';
import RowSelectionCustom from './examples/RowSelectionCustom';
import FilterAndSorter from './examples/FilterAndSorter';
import MultipleSorter from './examples/MultipleSorter';
import ResetFilterAndSorter from './examples/ResetFilterAndSorter';
import CustomizedFilterPanel from './examples/CustomizedFilterPanel';
import GroupingTableHead from './examples/GroupingTableHead';

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
