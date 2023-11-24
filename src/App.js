import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
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

import antdTableExt from './lib';

import en_US from './lib/locale/en_US';
import ru_RU from './lib/locale/ru_RU';

function App() {
	const [locale, setLocale] = useState('en_US');
	useEffect(() => {
		if (locale == 'ru_RU') {
			antdTableExt.locale = ru_RU;
		} else {
			antdTableExt.locale = en_US;
		}
	}, [locale])
	return <div style={{ padding: 20 }}>
		Locale: <Select value={locale} onChange={setLocale}>
            <Select.Option value={'en_US'}>en_US</Select.Option>
            <Select.Option value={'ru_RU'}>ru_RU</Select.Option>
        </Select><br/>
		GroupingTableHead:<br /><GroupingTableHead />
		<br />
		Basic:<br /><Basic />
		<br />
		RowSelection: <RowSelection />
		<br />
		RowSelectionAndOperation:<br /><RowSelectionAndOperation />
		<br />
		RowSelectionCustom:<br /><RowSelectionCustom />
		<br />
		FilterAndSorter:<br /><FilterAndSorter />
		<br />
		MultipleSorter:<br /><MultipleSorter />
		<br />
		ResetFilterAndSorter:<br /><ResetFilterAndSorter />
		<br />
		CustomizedFilterPanel:<br /><CustomizedFilterPanel />
		<br />
		DynamicSettings:<br /><DynamicSettings />
		<br />
		EditableRows:<br /><EditableRows />
		<br />
		NestedTables:<br /><NestedTables />
		<br />
		Summary:<br /><Summary />
	</div>
}

export default App;
