const XLSX = require('xlsx');

function readFile(path) {
    let workbook = XLSX.readFile(path, { type: 'string', raw: true, sheetStubs: true });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
}

module.exports = {
    readFile
};