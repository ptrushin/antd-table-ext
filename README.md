![antd-table-ext](https://user-images.githubusercontent.com/31502778/219711126-03bb3eed-9a03-44c1-9316-4b98e5b932b6.gif)

Examples - https://ptrushin.github.io/antd-table-ext/

# usage
* change source for import Table from 'antd' to 'antd-table-ext'
* ... profit!
* try to resize column
* try to move column
* try to visible/hide column (with context menu on right click)
* try to fix column (with context menu on right click)
* try to multiple sort with shift button
* column current width, index, visible, fix store in local storage between browser sessions - try to close and open page
* column filter and sort can store in address bar (by settings)
* export to excel

# examples
* all examples were taken from https://ant.design/components/table

# localization
* gets from locale prop

# additional table properties
Property | Description| Default
-|-|-
fullscreen | true / {deltaY: ?} | false
stateStorable | true / {prefix, storeDefault, localStorage = true, location = true } | true
defaults | | <code><br/>{<br/>movable: true,<br/>resizable: true,<br/>hideable: true,<br/>fixable: true,<br/>sortable: false,<br/>filterable: false,<br/>ellipsis: true<br/>}</code>
history | {location, push} (react-router-dom) |
locale | json like example locale |
addLastColumn | add last column to expand table to 100% | true
onColumnMoved ||
onColumnResized ||
onColumnHid ||
onColumnFixed ||
onColumnSorted ||
onColumnFiltered ||
onColumnChanged ||
onResetColumnSettings ||

# additional column properties
Property | Description| Default
-|-|-
width | defaultWidth |
currentWidth || 
resizable || true
defaultHidden || false
currentHidden || 
hideable || true
currentIndex ||
movable || true
fixed | defaultFixed |
currentFixed ||
fixable || true
defaultSortOrder ||
sortOrder || 
sorter/sortable || true
currentSortIndex ||
description ||
filterSerialize ||
filterDeserialize ||

