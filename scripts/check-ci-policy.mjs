import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseDocument } from 'yaml';

// Deliberately narrow: changes to CI commands or npm scripts require an explicit
// policy change. A copied deployment workflow must fail instead of being ignored.
const approvedSteps = [
  { uses: 'actions/checkout@v4', with: { 'persist-credentials': false } },
  {
    uses: 'actions/setup-node@v4',
    with: { 'node-version-file': '.nvmrc', cache: 'npm' },
  },
  { run: 'npm ci' },
  { run: 'npm run check:ci-policy' },
  { run: 'npm run format:check' },
  { run: 'npm test' },
  { run: 'npm run build' },
  { run: 'npm run build-storybook -- --disable-telemetry' },
];

const approvedScripts = {
  dev: 'vite --host 0.0.0.0',
  build: 'tsc --noEmit && vite build',
  preview: 'vite preview --host 0.0.0.0',
  typecheck: 'tsc --noEmit',
  storybook: 'storybook dev -p 6006 --no-open',
  'build-storybook': 'storybook build',
  test: 'node --test scripts/check-ci-policy.test.mjs && vitest run',
  'test:watch': 'vitest',
  format: 'prettier --write .',
  'format:check': 'prettier --check .',
  'check:ci-policy': 'node scripts/check-ci-policy.mjs',
};

export function assertCiOnlyPolicy(workflowFiles, manifest) {
  assert.deepEqual(
    Object.keys(workflowFiles).sort(),
    ['ci.yml'],
    'Only the validation workflow ci.yml is permitted. No CD workflows.',
  );
  const source = workflowFiles['ci.yml'];
  // No secret, token, dispatch, or other dynamic expression belongs in this
  // fixed validation pipeline. checkout receives only GitHub's read-only token.
  assert.ok(
    !source.includes('${{'),
    'Workflow expressions and secret references are not permitted.',
  );
  const document = parseDocument(source, { uniqueKeys: true });
  assert.equal(
    document.errors.length,
    0,
    'Workflow YAML must be valid and have unique keys.',
  );
  const workflow = document.toJS({ maxAliasCount: 0 });
  assert.deepEqual(
    Object.keys(workflow).sort(),
    ['jobs', 'name', 'on', 'permissions'],
    'Unexpected workflow configuration.',
  );
  assert.deepEqual(
    workflow.permissions,
    { contents: 'read' },
    'CI must have read-only repository permissions.',
  );
  assert.deepEqual(
    workflow.on,
    {
      push: { branches: ['develop', 'main'] },
      pull_request: { branches: ['develop', 'main'] },
    },
    'Only pushes and PRs for develop/main are permitted.',
  );
  assert.deepEqual(
    Object.keys(workflow.jobs),
    ['check'],
    'Only the validation job is permitted.',
  );
  const job = workflow.jobs.check;
  assert.deepEqual(
    Object.keys(job).sort(),
    ['name', 'runs-on', 'steps', 'timeout-minutes'],
    'No deployment environments, reusable workflows, credentials, or extra job options.',
  );
  assert.equal(job['runs-on'], 'ubuntu-latest');
  assert.equal(job['timeout-minutes'], 15);
  assert.deepEqual(
    job.steps,
    approvedSteps,
    'CI steps must remain the approved install, policy, formatting, tests, and builds.',
  );
  assert.equal(
    manifest.private,
    true,
    'Keep the package private to prevent accidental npm publication.',
  );
  assert.deepEqual(
    manifest.scripts,
    approvedScripts,
    'npm scripts must remain validation/development only; publishing and deployment hooks are not permitted.',
  );
}

function main() {
  const directory = resolve('.github/workflows');
  const files = Object.fromEntries(
    readdirSync(directory).map((name) => [
      name,
      readFileSync(resolve(directory, name), 'utf8'),
    ]),
  );
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
  assertCiOnlyPolicy(files, manifest);
  console.log(
    'CI-only policy passed: no deployment jobs, publishing scripts, secret references, or write permissions.',
  );
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  try {
    main();
  } catch (error) {
    console.error(`CI-only policy failed: ${error.message}`);
    process.exitCode = 1;
  }
}
