import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse, stringify } from 'yaml';
import { assertCiOnlyPolicy } from './check-ci-policy.mjs';

const source = readFileSync(
  new URL('../.github/workflows/ci.yml', import.meta.url),
  'utf8',
);
const manifest = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

function alteredWorkflow(change) {
  const workflow = parse(source);
  change(workflow);
  return { 'ci.yml': stringify(workflow) };
}

test('the actual repository configuration satisfies the CI-only policy', () => {
  assert.doesNotThrow(() => assertCiOnlyPolicy({ 'ci.yml': source }, manifest));
});

test('rejects a second workflow, including a copied portfolio deployment', () => {
  assert.throws(
    () =>
      assertCiOnlyPolicy(
        { 'ci.yml': source, 'deploy.yml': 'name: Deploy' },
        manifest,
      ),
    /No CD workflows/,
  );
});

test('rejects deployment or cross-repository dispatch steps', () => {
  const files = alteredWorkflow((workflow) =>
    workflow.jobs.check.steps.push({ run: 'npx wix release' }),
  );
  assert.throws(() => assertCiOnlyPolicy(files, manifest), /CI steps/);
});

test('rejects elevated token permissions', () => {
  const files = alteredWorkflow((workflow) => {
    workflow.permissions['id-token'] = 'write';
  });
  assert.throws(() => assertCiOnlyPolicy(files, manifest), /read-only/);
});

test('rejects deployment environments on the validation job', () => {
  const files = alteredWorkflow((workflow) => {
    workflow.jobs.check.environment = 'production';
  });
  assert.throws(
    () => assertCiOnlyPolicy(files, manifest),
    /No deployment environments/,
  );
});

test('rejects credentials or arbitrary expressions in action configuration', () => {
  const files = alteredWorkflow((workflow) => {
    workflow.jobs.check.steps[0].with.token = '${{ secrets.WIX_TOKEN }}';
  });
  assert.throws(() => assertCiOnlyPolicy(files, manifest), /secret references/);
});

test('rejects persistent checkout credentials or another repository target', () => {
  const files = alteredWorkflow((workflow) => {
    workflow.jobs.check.steps[0].with['persist-credentials'] = true;
  });
  assert.throws(() => assertCiOnlyPolicy(files, manifest), /CI steps/);
});

test('rejects deployments hidden in npm build commands', () => {
  const changed = structuredClone(manifest);
  changed.scripts.build += ' && npx wix release';
  assert.throws(
    () => assertCiOnlyPolicy({ 'ci.yml': source }, changed),
    /publishing and deployment hooks/,
  );
});

test('rejects npm lifecycle hooks, publishing scripts, and a publishable package', () => {
  const changed = structuredClone(manifest);
  changed.scripts.postbuild = 'npx wix release';
  assert.throws(
    () => assertCiOnlyPolicy({ 'ci.yml': source }, changed),
    /publishing and deployment hooks/,
  );
  assert.throws(
    () =>
      assertCiOnlyPolicy({ 'ci.yml': source }, { ...manifest, private: false }),
    /prevent accidental npm publication/,
  );
});

test('rejects release triggers and additional jobs', () => {
  const trigger = alteredWorkflow((workflow) => {
    workflow.on.release = { types: ['published'] };
  });
  assert.throws(
    () => assertCiOnlyPolicy(trigger, manifest),
    /Only pushes and PRs/,
  );
  const job = alteredWorkflow((workflow) => {
    workflow.jobs.publish = { 'runs-on': 'ubuntu-latest', steps: [] };
  });
  assert.throws(
    () => assertCiOnlyPolicy(job, manifest),
    /Only the validation job/,
  );
});
