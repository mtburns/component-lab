# CI-only policy

## Purpose

Component Lab demonstrates component development, collaboration, source control, and QA. It has no staging or production server. `main` means reviewed examples. No branch may deploy this repo to the portfolio server or trigger the portfolio's workflow.

Integration is manual: copy a reviewed component into a feature branch in the portfolio repository, then follow that repository's review and release process independently.

## Allowed automation

One workflow, `.github/workflows/ci.yml`, runs on pushes to `develop`/`main` and on pull requests targeting those branches. Its only job is `Validate components and CI-only policy`.

It checks out this repository without persisting credentials, selects the Node version, installs locked dependencies, validates this policy, checks formatting, runs tests, checks TypeScript, and builds the demo and Storybook locally on the runner. Build output is not uploaded or deployed.

Repository token permissions are limited to `contents: read`; all omitted permissions are disabled by GitHub. There is no `id-token: write`, `pages: write`, deployment environment, secret reference, publishing command, reusable workflow, or cross-repository dispatch.

## Guard behavior

`npm run check:ci-policy` parses workflow YAML and checks its structure against the small approved set of jobs, actions, options, and commands. It also checks that `package.json` remains private and its scripts match the approved development/validation commands. The guard rejects extra workflow files and npm hooks that could hide a deployment in a build command.

The allowlist is intentionally strict. To add a legitimate check later, review the workflow, guard, tests, and documentation together rather than disabling the guard.

`npm test` includes policy tests that attempt prohibited changes, such as a copied deployment workflow, a release command, elevated token permissions, deployment environments, secrets, persistent checkout credentials, additional event triggers, and deployment hidden in npm scripts. Those changes must fail validation.

## Make passing CI mandatory

Once the first workflow run registers its status check, configure branch protection or repository rulesets for both `develop` and `main`:

- Require a pull request before merging.
- Require `Validate components and CI-only policy` to pass.
- Block force pushes and branch deletion.
- Use the same rules for routine administrator work if that matches your chosen repository settings.

No branch protection settings were changed from this project. Those are GitHub repository settings, separate from the workflow source. CI must be enabled and required to block merges; an unrequired failed check is only a warning in the PR interface.

## Scope of enforcement

This is a reviewable guard against accidental deployment configuration, not a sandbox for arbitrary code or protection from a repository administrator intentionally rewriting the guard and rules. Source-code changes still require review. Keep portfolio hosting credentials out of this repo and its Actions settings. Do not authorize a hosting provider to auto-deploy this repository.

The project does not use or alter the portfolio repository's existing automation.
