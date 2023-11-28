import xlsx from 'better-xlsx';
import { saveAs } from 'file-saver';
import { getColumnsTreeData, getTreeLeafColumns, getColumnsHeadersCnt, getRecordValue } from './columnUtils';

export const excelExporter = (columns, dataSource, { fileName = 'excel.xlsx', worksheetName = 'Worksheet', fontName = 'Calibri', fontSize = 11 } = {}) => {
    const file = new xlsx.File();
    const sheet = file.addSheet(worksheetName);
    const treeColumns = getColumnsTreeData(columns, true);
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
            const cell = initCell(r, cc, column.title instanceof Function ? column.title() : column.title);
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
            console.log(column.key, column)
            const v = getRecordValue(row, column.dataIndex);
            const vv = column.renderToExcel
                ? column.renderToExcel(v, row)
                : column.render
                    ? column.render(v, row)
                    : v
            initCell(r, c, vv);
            c++;
        }
        r++;
    }
    file.saveAs('blob').then(content => saveAs(content, fileName));
}

export default excelExporter;