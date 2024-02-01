import * as core from '@actions/core';
import { Octokit } from '@octokit/rest'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {trimWhitespace: true, required: true} ) || '';
    const repository = core.getInput('repository', {trimWhitespace: true, required: true} ) || '';
    const prefix = core.getInput('prefix', {trimWhitespace: true} ) || '';
    const newValue = core.getInput('new-value', {trimWhitespace: true, required: true} ) || '';
    const env = core.getInput('environment', {trimWhitespace: true} ) || 'INTEGRATION';
    const variableName = core.getInput('variable-name', {trimWhitespace: true} ) || '';

    let repositoryVariable = `${ prefix.toLowerCase() }${ env.toUpperCase() }`;

    if(variableName) {
        repositoryVariable = variableName
    }

    const [owner, repo] = repository.split('/');

    if(!token) return ;

    const octokit = new Octokit({auth: token})

    const test = await octokit.request(`PATCH /repos/${owner}/${repo}/actions/variables/${repositoryVariable}`, {
        owner,
        repo,
        name: repositoryVariable,
        value: newValue,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

    console.log({test,env,newValue,variableName,prefix,repository })
    core.setOutput('json-value', {test,env,newValue,variableName,prefix,repository })

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
