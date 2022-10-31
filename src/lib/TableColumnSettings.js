import React from 'react';
import { Modal, Button, Tabs, Radio, Tree } from 'antd';
import locale_en_US from './locale/en_US';

const width = 400;

const TableColumnSettings = ({ locale: localeProps, visible, x, y, columnKey, onResetColumnSettings, onClose, columns, allColumns, onColumnVisible, onColumnFixed }) => {
    const locale = localeProps || locale_en_US;

    const column = allColumns.filter(_ => _.key === columnKey)[0];

    const fixedChange = (e) => {
        if (!onColumnFixed) return;
        let fixed = e.target.value;
        onColumnFixed({ columnKey: column.key, fixed: fixed });
        onClose();
    }
    const visibleChange = (checkedKeys) => {
        if (!onColumnVisible) return;
        for (let c of allColumns) {
            const newHidden = checkedKeys.checked.indexOf(c.key) < 0;
            if (c.hidden !== newHidden) onColumnVisible({ columnKey: c.key, hidden: newHidden });
        }
    };
    const getTreeData = () => {
        const getNodes = (columns) => {
            let nodes = []
            for (let column of columns.sort((a, b) => a.index - b.index)) {
                let node = {
                    title: column.title instanceof Function ? column.title() : column.title,
                    key: column.key,
                    disabled: column.hideable === false
                };
                if (column.children) {
                    node.children = getNodes(column.children);
                }
                nodes.push(node);
            }
            return nodes;
        }
        return getNodes(columns);
    }
    const getCheckedKeys = () => {
        return allColumns.filter(_ => !_.hidden).map(_ => _.key);
    }
    return visible &&
        <Modal visible={visible} open={visible} onCancel={onClose} width={width} closable={false} footer={null} style={{ position: 'absolute', left: `${(x > width + 100 ? x - width : x)}px`, top: `${y}px` }}>
            <Tabs items={[
                {
                    label: locale.Table.column,
                    key: "column",
                    children: <React.Fragment>
                        {locale.Table.fix}: <Radio.Group onChange={fixedChange} value={column.fixed}>
                            <Radio value={'left'}>{locale.Table.onLeft}</Radio>
                            <Radio value={'right'}>{locale.Table.onRight}</Radio>
                            <Radio value={undefined}>{locale.Table.undefined}</Radio>
                        </Radio.Group>
                    </React.Fragment>
                },
                {
                    label: locale.Table.visibility,
                    key: "visible",
                    children: <Tree
                        checkable
                        checkStrictly={true}
                        treeData={getTreeData()}
                        checkedKeys={getCheckedKeys()}
                        onCheck={visibleChange}
                    />
                },
                {
                    label: locale.Table.common,
                    key: "common",
                    children: <Button onClick={onResetColumnSettings}>{locale.Table.resetToDefault}</Button>
                }
            ]} />
        </Modal>
}

export default TableColumnSettings;