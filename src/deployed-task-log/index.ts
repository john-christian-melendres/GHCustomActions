import * as core from '@actions/core'
import * as command from '@actions/exec'

interface ICommitLog {
  commit: string;
  author: string;
  message: string;
  url: string;
}

async function run(): Promise<void> {
  try {
    const startCommitHash = core.getInput('commit-hash', {trimWhitespace: true, required: true} ) || 'HEAD'
    const endCommitHash = 'HEAD'
    const repository = core.getInput('repository', {trimWhitespace: true, required: true} )
    
    let gitLogs: ICommitLog[] = []
    let execErrors = '';

    const execOptions = {
      listeners: {
        stdout: (data: Buffer) => {
          let dataString = data.toString().replace(/[']/g, '');
          let log: ICommitLog = JSON.parse(dataString);
          updateLogURL(log, repository)
          console.log(log)
          gitLogs.push(log)
        },
        stderr: (data: Buffer) => {
          execErrors += data.toString();
        }
      }
    };

    await command.exec('git', ['log', `--pretty=format:'{%n  \"commit\": \"%H\",%n  \"author\": \"%an\",%n \"message\": \"%s\"%n}'` ,`${startCommitHash}^1..${endCommitHash}`],  execOptions);

    const latestCommitId = getMergePullRequestCommit(gitLogs);
    gitLogs = removeMergePullRequestCommit(gitLogs);
    
    core.setOutput('json-value', gitLogs)
    core.setOutput('latest-commit-id', latestCommitId)
  
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function updateLogURL(gitLog: ICommitLog, repository: string): void {
  if (!!repository) return;

  let url = `https://github.com/${repository}/commit/${gitLog.commit}`
  let pullRequestId = gitLog.message?.match(/\(#(.*)\)/)?.pop();

  if(pullRequestId) {
    url = `https://github.com/${repository}/pull/${pullRequestId}`
  }

  gitLog.url = url;
}

function getMergePullRequestCommit(gitLogs: ICommitLog[]): string {
  let [ mergePullRequestCommit ] =  gitLogs.filter( log => log.message.toLowerCase().includes('merge pull request'))

  return mergePullRequestCommit.commit || '';
}


function removeMergePullRequestCommit(gitLogs: ICommitLog[]): ICommitLog[] {
  return gitLogs.filter( log => !log.message.toLowerCase().includes('merge pull request'))
}

run();