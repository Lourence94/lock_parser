import fs from 'fs/promises'
import {createReadStream} from 'fs'
import path from "path";
import {parse} from 'yaml'
import * as ExcelJS from 'exceljs'
import util from 'util'
import {exec} from "child_process";
import ndjson from 'ndjson'

const asyncExec = util.promisify(exec)

async function main() {
    const demoPath = path.resolve('C:\\Users\\Lourence\\Projects\\cxbox-demo\\ui\\yarn.lock')

    let file = await fs.readFile(demoPath, 'utf-8')
    let json = parse(file)

    const xls = new ExcelJS.Workbook()
    const table = await xls.xlsx.readFile('deps_fe.xlsx')

    const ws = table.addWorksheet('deps')

    const data = Object.entries(json).filter(value => value[0] !== '__metadata').map(([key, val], index) => ({id: index + 1, name: key.split('@npm:')[0].split('@patch:')[0], ver: (val as any).version}))



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

    const npmDataArr: {name: string, time: Record<string, string>, gitLink?: string}[] = []

    createReadStream('data.txt').pipe(ndjson.parse()).on('data', npmData => {
        npmDataArr.push({name: npmData.name, time: npmData.time, gitLink: npmData?.repository?.url})
    }).on('end', () => {
        const tableRows = data.map(lockData => {
            const item = npmDataArr.find(npmData => npmData.name === lockData.name)
            return [lockData.id, lockData.name, String(lockData.ver), new Intl.DateTimeFormat('ru-RU').format(new Date(item?.time?.[lockData.ver] ?? 0)), item?.gitLink]
        })

        ws.addRows(tableRows)

        table.xlsx.writeFile('deps.xlsx')
    })





}

main()
