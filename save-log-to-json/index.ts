import * as core from '@actions/core'
import { writeFile, readFile, access, constants } from 'fs/promises'

const FILENAME = 'log';

async function run(): Promise<void> {
  try {
    const jsonInput = core.getMultilineInput('json', {trimWhitespace: true, required: true} ) || '';

    await checkFile();
    console.log('jsonInput', jsonInput)  
    const data = await readFile(`${FILENAME}.json`, "utf8");
    const jsonInputData = inputToJson(jsonInput);
    console.log('jsonInputData', jsonInputData)
    let fileData: IJsonSchema = JSON.parse(data);
    console.log('fileData',fileData)

    fileData = { ...fileData, ...jsonInputData };
    console.log('fileData',fileData)

    await writeFile(`${FILENAME}.json`,JSON.stringify(fileData, null, 4));

    const dataString = await readFile(`${FILENAME}.json`, "utf8");
    console.log('dataString',dataString)

    core.setOutput('json', fileData);
    core.setOutput('json-string', dataString);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function checkFile(): Promise<boolean> {
  try {
    await access(`${FILENAME}.json`, constants.F_OK)
    return true
  } catch (error) {
    await writeFile(`${FILENAME}.json`,JSON.stringify({}, null, 4))
    return false
  }
}

function inputToJson(input: string[]) {
  const json = {}

  input.forEach(element => {
    if(element) {
      const key = element.split(':').shift()?.trim();
      const value = element.split(':').slice(1).join(":").trim();

      if(key) json[key] = value;
    }
  });

  return json;
}

function fixJsonString(str) {
  const fixedStr = str.replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
  return JSON.parse(fixedStr);
 }

run();

interface IJsonSchema {
    status: string;
    environment: string;
    repository: string;
    runBy: string;
    packageName: string;
    latestCommitHash: string;
    commitLogs: {
      commit: string;
      author: string;
      message: string;
      url: string;
    }[];
    
  }