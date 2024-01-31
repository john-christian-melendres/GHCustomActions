import * as core from '@actions/core'
import { writeFile, readFile, access, constants } from 'fs/promises'

async function run(): Promise<void> {
  try {
    const jsonInput = core.getInput('json', {trimWhitespace: true, required: true} ) || 'HEAD'

    await checkFile();

    const data = await readFile("./log.json", "utf8");
    const jsonInputData = JSON.parse(jsonInput);
    let fileData: IJsonSchema = JSON.parse(data);

    console.log(jsonInputData)
    console.log(fileData)

    fileData = { ...fileData, ...jsonInputData };

    await writeFile('./log.json',JSON.stringify({}, null, 4))

    const dataString = await readFile("./log.json", "utf8");

    console.log(dataString)
    console.log(fileData)

    core.setOutput('json', fileData);
    core.setOutput('json-string', dataString);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function checkFile(): Promise<boolean> {
  try {
    await access('./log.json', constants.F_OK)
    return true
  } catch (error) {
    await writeFile('./log.json',JSON.stringify({}, null, 4))
    return false
  }
}

run()

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
      message: string
    }[];
    
  }