import React from 'react';
import { renderToString } from 'react-dom/server'
import xlsx from 'better-xlsx';
import { saveAs } from 'file-saver';
import { htmlToText } from 'html-to-text'
import { getColumnsTreeData, getTreeLeafColumns, getColumnsHeadersCnt, getRecordValue } from './columnUtils';

const htmlToTextOptions = {
    tags: { 'a': { options: { ignoreHref: true } } }
}

export const excelExporter = (columns, dataSource, { fileName = 'excel.xlsx', worksheetName = 'Worksheet', fontName = 'Calibri', fontSize = 11 } = {}) => {
    const file = new xlsx.File();
    const sheet = file.addSheet(worksheetName);
    const treeColumns = getColumnsTreeData(columns, true, true);
    const treeLeafColumns = getTreeLeafColumns(treeColumns);
    const headersCnt = getColumnsHeadersCnt(treeLeafColumns);
    for (let i in treeLeafColumns) {
        sheet.col(i).style.font.size = fontSize;
        sheet.col(i).style.font.name = fontName;
    }
    const initCell = (r, c, value) => {
        const cell = sheet.cell(r, c);
        cell.style.font.size = fontSize;
        cell.style.font.name = fontName;
        cell.value = value;
        return cell;
    }
    const showHeaders = (columns, r, c) => {
        let cc = c;
        let cl = 0;
        for (let column of columns) {
            //const row = sheet.row(r);
            const cell = initCell(r, cc, htmlToText(renderToString(column.title instanceof Function ? column.title() : column.title), htmlToTextOptions));
            cell.style.font.bold = true;
            if (column.children && column.children.length > 0) {
                const l = showHeaders(column.children, r + 1, cc);
                cell.hMerge = l - 1;
                cc += l;
                cl += l;
            } else {
                if (r < headersCnt - 1) cell.vMerge = headersCnt - r - 1;
                cc++;
                cl++;
            }
        }
        return cl;
    }
    showHeaders(treeColumns, 0, 0);
    let r = headersCnt;
    for (let row of dataSource) {
        let c = 0;
        for (let column of treeLeafColumns) {
            const v = column.dataIndex ? getRecordValue(row, column.dataIndex) : null;
            const vv = column.renderToExcel
                ? column.renderToExcel(v, row)
                : column.render
                    ? htmlToText(renderToString(column.render(v, row)), htmlToTextOptions)
                    : v
            initCell(r, c, vv);
            c++;
        }
        r++;
    }
    file.saveAs('blob').then(content => saveAs(content, fileName));
}

export default excelExporter;