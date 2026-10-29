# Component Lab

Reusable frontend components by Travis Burns, with interactive examples and the reasoning behind the code. React, TypeScript, Tailwind CSS, and Storybook.

**Status:** first working draft. Travis selected the direction and stack; his implementation review and approval for `main` are pending. See [AI usage](AI_USAGE.md) and the [review checklist](docs/REVIEW.md).

**CI only.** This repository has no production or staging server and must never deploy to the portfolio's hosting. `main` holds reviewed examples; it is not a deployment trigger. Portfolio integration is a separate, manual change in the portfolio repository.

## Run locally

Use Node 24 LTS (also recorded in `.nvmrc`). From this directory:

```sh
npm ci
npm run storybook
```

Storybook opens at `http://localhost:6006`. The component's Docs page explains its purpose, decisions, limitations, and AI assistance. The five stories show the default collection, search without categories, empty data, a single item, and an unrelated filament inventory using the same component.

For the standalone visual demo:

```sh
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

## Checks

```sh
npm run check:ci-policy
npm test
npm run build
npm run build-storybook
```

`npm run build` checks TypeScript and produces the demo in `dist/`. Storybook builds separately into `storybook-static/`. `npm run format:check` checks formatting; `npm run format` applies it.

The component behavior tests cover search, combined filtering, empty results, clearing/focus, keyboard operation, multiple instances, changed props, and reuse with another data model. An axe test checks structural accessibility in jsdom; it does **not** check color contrast. Passing it is not a conformance certification. `npm test` also exercises the CI-only guard against attempted deployment steps, extra workflows, elevated permissions, secret references, and npm publishing/deployment hooks.

## Start reading here

- [Component and typed API](src/components/searchable-collection/SearchableCollection.tsx)
- [Interactive stories and documentation](src/components/searchable-collection/SearchableCollection.stories.tsx)
- [Behavior tests](src/components/searchable-collection/SearchableCollection.test.tsx)
- [Decisions and integration notes](docs/searchable-collection.md)
- [AI contribution record](AI_USAGE.md)
- [Human review checkpoint](docs/REVIEW.md)
- [Branching and CI-only policy](docs/ci-policy.md)

The generic collection does not know about resources or cards. Consumers provide item keys, searchable text, optional filter configuration, and a render function. `src/demo/` provides one visual treatment; the filament story supplies another.

## Branch workflow

The project lives in its own `mtburns/component-lab` repository. Preserve your clone's Git metadata when copying source files.

1. Branch from `main` into a focused `feature/...` branch.
2. Make and review changes on that feature branch.
3. Open a pull request into `develop` and require passing checks.
4. QA locally from `develop` using Storybook and the visual demo.
5. After Travis confirms the result, merge `develop` into `main` through a pull request.

There is no deployment after either merge. CI runs for pushes and pull requests targeting `develop` and `main`. It validates the CI-only policy, formatting, tests, TypeScript, and both builds. It has read-only repository permissions, does not persist checkout credentials, and has no deployment jobs, environments, secret references, external workflow calls, or publishing steps.

Configure branch rules to require the `Validate components and CI-only policy` check on both `develop` and `main` after the initial workflow has run. Local scripts alone do not make a GitHub check mandatory. See [the policy](docs/ci-policy.md) for the enforcement boundary and setup notes. No branch rules have been changed by the project files.

The downloadable archive omits Git metadata. No open-source license has been selected yet.

## Later portfolio integration

Manually copy selected, reviewed component source into a feature branch in the portfolio repository and supply project data/card markup there. The portfolio's own review and deployment process applies only to that separate change. This repo never triggers it, dispatches to it, or shares its hosting credentials.

The component uses React hooks and includes a `use client` boundary for Next.js. Include its source in the consuming Tailwind build's scanned files. This draft is not an npm package; the package stays private to prevent accidental publication.

Neither the existing portfolio nor its deployment has been changed.
