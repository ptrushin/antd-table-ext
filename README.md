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

# restrictions
* JSX style not supported

# examples
* all examples were taken from https://ant.design/components/table

# localization
* gets from locale prop

# properties
Property | Description| Default
-|-|-
fullscreen | true / {deltaY: ?} | false
stateStorable | true / {prefix, localStorage = true || {}, location = true } | true
defaults | | ```json
{
    movable: true,
    resizable: true,
    hideable: true,
    fixable: true,
    sortable: false,
    filterable: false,
    ellipsis: true
}```
