import * as core from '@actions/core'
import { writeFile, readFile, access, constants } from 'fs/promises'

const FILENAME = 'log';

async function run(): Promise<void> {
  try {
    const jsonInput = core.getInput('json', {trimWhitespace: true, required: true} ) || 'HEAD';

    await checkFile();
      
    const data = await readFile(`${FILENAME}.json`, "utf8");
    const jsonInputData = JSON.parse(jsonInput);
    let fileData: IJsonSchema = JSON.parse(data);

    fileData = { ...fileData, ...jsonInputData };

    await writeFile(`${FILENAME}.json`,JSON.stringify(fileData, null, 4));

    const dataString = await readFile(`${FILENAME}.json`, "utf8");

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