import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { trimWhitespace: true, required: true }) || ''
    const repository = core.getInput('repository', { trimWhitespace: true, required: true }) || ''
    const newValue = core.getInput('new-value', { trimWhitespace: true, required: true }) || ''
    const variableName =  core.getInput('variable-name', { trimWhitespace: true }) || ''
    const env = core.getInput('environment', { trimWhitespace: true }) || 'INTEGRATION'
    const prefix = core.getInput('prefix', { trimWhitespace: true }) || ''

    let repositoryVariable = `${prefix.toLowerCase()}${env.toUpperCase()}`

    if (variableName) {
      repositoryVariable = variableName
    }

    if (!token) return

    const octokit = new Octokit({ auth: token })

    await octokit.request(
      `PATCH /repos/${repository}/actions/variables/${repositoryVariable}`,
      {
        name: repositoryVariable,
        value: newValue,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
          accept: 'application/vnd.github+json'
        }
      }
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
