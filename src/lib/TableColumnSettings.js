import React from 'react';
import { Modal, Button, Tabs, Radio, Tree } from 'antd';
import { getColumnsTreeData } from './columnUtils';
import global from './global';
import './table.css';

const width = 400;

const TableColumnSettings = ({ locale: propsLocale = {}, visible, x, y, columnKey, onResetColumnSettings, onClose, columns, allColumns, onColumnVisible, onColumnFixed, tableRef, onExportToExcel }) => {
    const locale = {...global.locale, ...propsLocale};

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
            if (c.currentHidden !== newHidden) onColumnVisible({ columnKey: c.key, hidden: newHidden });
        }
    };
    const getCheckedKeys = () => {
        return allColumns.filter(_ => !_.currentHidden).map(_ => _.key);
    }
    const getTreeData = () => {
        const getNodes = (columns) => {
            let nodes = []
            for (let column of columns) {
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
        return getNodes(getColumnsTreeData(columns));
    }
    return visible &&
        <Modal open={visible} onCancel={onClose} width={width} closable={false} footer={null} style={{ position: 'absolute', left: `${(x > width + 100 ? x - width : x)}px`, top: `${y}px` }}>
            <Tabs items={[
                {
                    label: locale.AntdTableExt.Table.column,
                    key: 'column',
                    children: <React.Fragment>
                        {locale.AntdTableExt.Table.fix}: <Radio.Group onChange={fixedChange} value={column.fixed}>
                            <Radio value={'left'}>{locale.AntdTableExt.Table.onLeft}</Radio>
                            <Radio value={'right'}>{locale.AntdTableExt.Table.onRight}</Radio>
                            <Radio value={undefined}>{locale.AntdTableExt.Table.undefined}</Radio>
                        </Radio.Group>
                    </React.Fragment>
                },
                {
                    label: locale.AntdTableExt.Table.visibility,
                    key: 'visible',
                    children: <React.Fragment>
                        <Tree
                            checkable
                            checkStrictly={true}
                            treeData={getTreeData()}
                            checkedKeys={getCheckedKeys()}
                            onCheck={visibleChange}
                        />
                    </React.Fragment>
                },
                {
                    label: locale.AntdTableExt.Table.common,
                    key: 'common',
                    children: <div className='button-block'>
                        {onExportToExcel && <><Button onClick={onExportToExcel}>{locale.AntdTableExt.Table.exportToExcel}</Button><br/></>}
                        <Button onClick={onResetColumnSettings}>{locale.AntdTableExt.Table.resetToDefault}</Button>
                    </div>
                }]}
            />
        </Modal>
}

export default TableColumnSettings;