import * as core from '@actions/core'

interface StepRun {
  id: string
  status: string
  stepType: string
  warning: boolean
  error: string | null
}

interface TestRun {
  id: string
  name: string
  status: string
  browserName: string
  browserVersion: string
  osName: string
  duration: string
  webappUrl: string
  stepsRuns: StepRun[]
}

interface SuiteRun {
  id: string
  name: string
  status: string
  profileName: string
  duration: string
  started: string
  ended: string
  sequence: number
  webappUrl: string
  testRuns: TestRun[]
}

function statusEmoji(status: string): string {
  switch (status.toLowerCase()) {
    case 'passed':
      return '✅'
    case 'failed':
      return '❌'
    case 'skipped':
      return '⏭️'
    default:
      return '❓'
  }
}

function formatDuration(duration: string): string {
  // duration format: "00:00:21.040713" → "21s"
  const parts = duration.split(':')
  if (parts.length !== 3) return duration
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  const seconds = parseFloat(parts[2])
  const segments: string[] = []
  if (hours > 0) segments.push(`${hours}h`)
  if (minutes > 0) segments.push(`${minutes}m`)
  segments.push(`${Math.round(seconds)}s`)
  return segments.join(' ')
}

async function run(): Promise<void> {
  try {
    const jsonInput = core.getInput('json', { required: true, trimWhitespace: true })
    const suite: SuiteRun = JSON.parse(jsonInput)

    const totalTests = suite.testRuns.length
    const passed = suite.testRuns.filter(t => t.status === 'passed').length
    const failed = suite.testRuns.filter(t => t.status === 'failed').length

    const lines: string[] = []

    lines.push(`## ${statusEmoji(suite.status)} BugBug Suite Run`)
    lines.push('')
    lines.push(`| Field | Value |`)
    lines.push(`|-------|-------|`)
    lines.push(`| **Name** | ${suite.name} |`)
    lines.push(`| **ID** | \`${suite.id}\` |`)
    lines.push(`| **Status** | ${statusEmoji(suite.status)} ${suite.status} |`)
    lines.push(`| **Profile** | ${suite.profileName} |`)
    lines.push(`| **Duration** | ${formatDuration(suite.duration)} |`)
    lines.push(`| **Started** | ${new Date(suite.started).toUTCString()} |`)
    lines.push(`| **Results** | ${passed} passed, ${failed} failed of ${totalTests} total |`)
    lines.push(`| **Link** | [View in BugBug](${suite.webappUrl}) |`)
    lines.push('')

    lines.push(`### Test Results`)
    lines.push('')
    lines.push(`| # | Test | Status | Browser | OS | Duration | Link |`)
    lines.push(`|---|------|--------|---------|-----|----------|------|`)

    for (const [i, test] of suite.testRuns.entries()) {
      const steps = test.stepsRuns.length
      const failedSteps = test.stepsRuns.filter(s => s.status === 'failed').length
      const stepInfo = failedSteps > 0 ? ` (${failedSteps}/${steps} steps failed)` : ''
      lines.push(
        `| ${i + 1} | ${test.name}${stepInfo} | ${statusEmoji(test.status)} ${test.status} | ${test.browserName} ${test.browserVersion} | ${test.osName} | ${formatDuration(test.duration)} | [View](${test.webappUrl}) |`
      )
    }

    await core.summary.addRaw(lines.join('\n')).write()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
