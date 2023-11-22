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
import DynamicSettings from './examples/DynamicSettings';
import EditableRows from './examples/EditableRows';
import NestedTables from './examples/NestedTables';
import Summary from './examples/Summary';

//import ru_RU from './lib/locale/ru_RU';
//import antdTableExt from './lib';

//antdTableExt.locale = ru_RU

function App() {
  return <div style={{padding: 20}}>
    GroupingTableHead:<br/><GroupingTableHead />
    <br/>
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
    DynamicSettings:<br/><DynamicSettings />
    <br/>
    EditableRows:<br/><EditableRows />
    <br/>
    NestedTables:<br/><NestedTables />
    <br/>
    Summary:<br/><Summary />
  </div>
}

export default App;
