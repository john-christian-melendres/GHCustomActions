import * as core from '@actions/core'
import * as exec from '@actions/exec'

export async function run(): Promise<void> {
  try {
    // const startCommitHash = core.getInput('commit-hash', {trimWhitespace: true, required: true} )
    const startCommitHash = 'HEAD'
    const endCommitHash = 'HEAD'

    console.log(startCommitHash)

    let myOutput = '';
    let myError = '';

    const options = {
      listeners: {
      stdout: (data: Buffer) => {
      myOutput += data.toString();
      },
      stderr: (data: Buffer) => {
      myError += data.toString();
      }
      }
    };

    await exec.exec('git', ['log', '--pretty=format:', `{%n  \"commit\": \"%H\",%n  \"author\": \"%an\",%n  \"date\": \"%ad\",%n  \"message\": \"%f\"%n},` ,`${startCommitHash}^1..${endCommitHash}`],  options);
    console.log(myOutput);
    console.log(myError);

    const test = `[${myOutput}]`
    console.log(test)

    core.setOutput('js-value', myOutput)
    // // get log rawTex"
    // const logTxts = execSync(
    //   `git log --pretty=format:"{%n  #'#commit#'#: #'#%H#'#,%n  #'#abbreviated_commit#'#: #'#%h#'#,%n  #'#tree#'#: #'#%T#'#,%n  #'#abbreviated_tree#'#: #'#%t#'#,%n  #'#parent#'#: #'#%P#'#,%n  #'#abbreviated_parent#'#: #'#%p#'#,%n  #'#refs#'#: #'#%D#'#,%n  #'#encoding#'#: #'#%e#'#,%n  #'#subject#'#: #'#%s#'#,%n  #'#sanitized_subject_line#'#: #'#%f#'#,%n  #'#body#'#: #'#%b#'#,%n  #'#commit_notes#'#: #'#%N#'#,%n  #'#verification_flag#'#: #'#%G?#'#,%n  #'#signer#'#: #'#%GS#'#,%n  #'#signer_key#'#: #'#%GK#'#,%n  #'#author#'#: {%n    #'#name#'#: #'#%aN#'#,%n    #'#email#'#: #'#%aE#'#,%n    #'#date#'#: #'#%aD#'#%n  },%n  #'#commiter#'#: {%n    #'#name#'#: #'#%cN#'#,%n    #'#email#'#: #'#%cE#'#,%n    #'#date#'#: #'#%cD#'#%n  }%n}," ${startCommitHash}..${endCommitHash}`,
    //   { encoding: 'utf8' }
    // ).toString()

    // // transform json
    // const logJson = `[${logTxts.slice(0, -1).replace(/"/g, "'").replace(/#'#/g, '"')}]`

    // fs.writeFileSync(path.join(__dirname, 'log.json'), logJson)

    // // parse json and do what you need
    // const subjectLines = JSON.parse(logJson).map(
    //   item => item['sanitized_subject_line']
    // )
    // console.info('subjectLines', subjectLines)

    // core.setOutput('JSONTEST', subjectLines )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}


run();