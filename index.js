"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const yaml_1 = require("yaml");
const ExcelJS = __importStar(require("exceljs"));
const util_1 = __importDefault(require("util"));
const child_process_1 = require("child_process");
const ndjson_1 = __importDefault(require("ndjson"));
const asyncExec = util_1.default.promisify(child_process_1.exec);
async function main() {
    const demoPath = path_1.default.resolve('C:\\Users\\Lourence\\Projects\\cxbox-demo\\ui\\yarn.lock');
    let file = await promises_1.default.readFile(demoPath, 'utf-8');
    let json = (0, yaml_1.parse)(file);
    const xls = new ExcelJS.Workbook();
    const table = await xls.xlsx.readFile('deps_fe.xlsx');
    const ws = table.addWorksheet('deps');
    const data = Object.entries(json).filter(value => value[0] !== '__metadata').map(([key, val], index) => ({ id: index + 1, name: key.split('@npm:')[0].split('@patch:')[0], ver: val.version }));
    /**
     * npm parser
     */
    // const step = 5
    // await fs.writeFile('data.txt', '')
    // for(let i = 0; i <=data.length; i+=step) {
    //     const some = data.slice(i, i + step)
    //     const names = some.map(val => `${val.name}@${val.ver}`).join(' ')
    //     console.log('begin', i, i+step)
    //     const res = await asyncExec(`yarn npm info ${names} --json --fields time,repository`)
    //     const collectedData = res.stdout
    //
    //     fs.appendFile('data.txt', collectedData)
    // }
    const npmDataArr = [];
    (0, fs_1.createReadStream)('data.txt').pipe(ndjson_1.default.parse()).on('data', npmData => {
        npmDataArr.push({ name: npmData.name, time: npmData.time, gitLink: npmData?.repository?.url });
    }).on('end', () => {
        const tableRows = data.map(lockData => {
            const item = npmDataArr.find(npmData => npmData.name === lockData.name);
            return [lockData.id, lockData.name, String(lockData.ver), new Intl.DateTimeFormat('ru-RU').format(new Date(item?.time?.[lockData.ver] ?? 0)), item?.gitLink];
        });
        ws.addRows(tableRows);
        table.xlsx.writeFile('deps.xlsx');
    });
}
main();
