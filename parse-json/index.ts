import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const jsonInput = core.getInput('json', { trimWhitespace: true, required: true }) || '{}';
    const excludedInput = core.getInput('excluded', { trimWhitespace: true, required: true }) || '';

    const excludedJsonProperty = normalizeExcludeInput(excludedInput);
    const jsonInputData = JSON.parse(jsonInput);

    core.setOutput('text', formatToStringSeparatedByNewline(jsonInputData, excludedJsonProperty));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

function formatToStringSeparatedByNewline(json, excludedProperties: string[]): string {
  const newStrings: string[] = []

  for (let [key, value] of Object.entries(json)) {
    if(excludedProperties.includes(key.toLocaleLowerCase())) continue;
    newStrings.push(`${formatJSONKey(key)}: ${value}`);
  }

  return newStrings.join("\r\n")
}

function normalizeExcludeInput(input: string): string[] {
  return input.toLocaleLowerCase().split(',')
}

function formatJSONKey(key): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
      return str.toUpperCase()
    });
}

run()
