# Review checkpoint — first slice

Started October 29, 2026; updated November 4, 2026. Dated entries below preserve the review history. The November 4 checkpoint and current checklist supersede earlier pending statuses. Final implementation approval for `main` has not yet been recorded. This repository has no production or staging deployment.

## Automated checks run by ChatGPT

- TypeScript check and standalone Vite production build: passed.
- Behavior tests: 12 passed. Includes keyboard simulation and one structural axe scan in jsdom with color contrast disabled because jsdom has no rendered layout.
- CI-only policy: passed, plus 10 policy tests passed. These reject extra workflows, deploy commands, elevated token permissions, deployment environments, secrets/expressions, persistent checkout credentials, npm hooks, publishable package settings, and extra triggers/jobs. GitHub branch rules are still pending; no repository settings were changed.
- Storybook static build: passed using an executor-only OS-interface fallback. The first standard build hit an environment restriction (`uv_interface_addresses`), not a component error. The fallback returns no interface addresses when enumeration is unavailable; it is outside this project and is not shipped. Normal `npm run build-storybook` should be used locally and in CI.
- Storybook's large-chunk warning is from the documentation/test tooling bundle; this has not been treated as a performance assessment of the component itself.

## Browser checks run by ChatGPT

Desktop Chromium preview:

- Demo rendered with all six resource cards.
- Text search plus category selection produced the expected result.
- Native radio arrow-key navigation changed category and displayed the empty state when appropriate.
- Clear restored all results and returned focus to the search field.
- No horizontal document overflow observed at the inspected desktop viewport.
- Storybook Docs rendered all five examples. The separate filament-inventory story filtered to PETG correctly.
- Default Storybook story's browser accessibility scan reported 0 violations, 25 passes, and 0 inconclusive results at the inspected desktop state. This is a scoped automated result, not a full accessibility audit.
- At Storybook's nominal 320px small-mobile viewport, the iframe's document client width and scroll width were both 305px (scrollbar occupies the remainder), with no horizontal overflow.

Browser checks are limited to the documented interactions. No claim is made that all browsers, widths, assistive technologies, or WCAG criteria were verified.

## Multi-select update — October 29, 2026

Automated verification after adding `filter.selection: 'multiple'`:

- 20 component tests passed, including the original single-select behavior, structural axe scans in both modes (contrast excluded in jsdom), OR matching across labels combined with all-term search, unchecking the last selection, reset/focus, Tab/Space operation, removed options, selection-mode changes, and instance isolation.
- 10 CI-only policy tests passed; `npm run check:ci-policy` passed separately.
- TypeScript and standalone Vite build passed. Storybook static build passed using the same executor-only OS-interface fallback described above.
- Formatting check passed.

Browser verification in Chromium on the updated Storybook Docs page:

- All six stories rendered, including Multi Select Labels and the filament inventory.
- Selecting Design and Development showed 4 / 6 resources. Adding the query `component` narrowed this to 1 / 6 and the expected Think in components card.
- Clear restored 6 / 6 and returned focus to the empty search input.
- Tab from search moved to the first checkbox when Clear was disabled. Space selected Design; Tab and Space added Development while keeping Design selected, returning 4 / 6.

Travis subsequently reported successful local interaction, keyboard, responsive, and zoom checks, recorded below. Remaining implementation review, screen-reader testing, contrast verification, and reduced-motion checks are still outstanding. Earlier desktop/mobile scan results above describe the first slice, not a new browser accessibility scan of the multi-select update.

## Review decisions reported by Travis

- Accepted the generic data/accessor/render-function separation for flexibility and portability.
- Added hex color values and swatches to the filament card example without changing the collection API.
- Accepted all-term substring search, including partial input such as `violet PL`.
- Requested an additional multi-select example, then confirmed the local behavior: selected categories combine their results, removing selections updates the results, and clearing the final selection restores all eligible items.
- Confirmed local keyboard navigation looked good after checking Tab/Shift+Tab, Space to toggle independent selections, visible focus, and Clear returning focus to search.
- Considered adding arrow navigation to multi-select labels, then chose to retain native checkbox behavior. Single-select keeps native radio arrow navigation.
- Confirmed responsive layout and 200% browser zoom looked good after the requested 320px and zoom checks. These are user-reported local checks, not a comprehensive browser or assistive-technology audit.

## November 4, 2026 — QA checkpoint before main

Reviewed baseline: `develop` at `7ad8841014d2a319e589f421f7b228f7f354fc6c`, merged through [PR #1](https://github.com/mtburns/component-lab/pull/1). [Draft PR #2](https://github.com/mtburns/component-lab/pull/2) proposes promotion to `main`.

### GitHub CI and branch rules

- The [develop push run](https://github.com/mtburns/component-lab/actions/runs/40914276833) and [promotion PR run](https://github.com/mtburns/component-lab/actions/runs/41919615945) passed for this baseline, including policy validation, formatting, tests, TypeScript/Vite build, and the standard Storybook build without the executor fallback.
- The multi-select suite recorded above contains 20 component tests and 10 policy tests. The earlier 12-test result describes the initial slice.
- Travis configured branch protection. GitHub's branch responses confirm that both `develop` and `main` are protected and require **Validate components and CI-only policy**. The connection cannot read the full administrative protection settings, so independent verification is limited to those exposed fields.

### Manual NVDA + Chrome checks reported by Travis

Travis tested the Default and Multi Select Labels stories on Windows with NVDA and Chrome. Exact NVDA and Chrome versions were not recorded.

- Search announced its visible label and editable search-field role.
- Search changes announced the result count, including "0 slash 6 items shown."
- Clear reset search and selections, restored results, and returned focus to search.
- Radios announced their labels, group positions, and selection states.
- Checkboxes announced their labels and checked/unchecked states. Multiple selections, deselection, count updates, and focus behavior passed the requested checks.
- Heading navigation followed a sensible hierarchy and announced heading levels.
- Card links announced distinct titles and level-three heading semantics. Travis reported "list with 6 items, Think in components, link heading level 3" followed by "Make room for change, link heading level 3."

These are human-reported checks of the documented stories and interactions, not AI-operated screen-reader tests or coverage of every assistive technology.

### Additional browser evidence from October 29

On the same multi-select implementation, the Chromium Storybook accessibility panel reported:

| Inspected state                                    | Violations | Passes | Inconclusive |
| -------------------------------------------------- | ---------- | ------ | ------------ |
| No selected labels                                 | 0          | 25     | 0            |
| Design and Development selected, 4 / 6 results     | 0          | 25     | 1            |
| Same labels with an unmatched query, 0 / 6 results | 0          | 22     | 1            |

The inconclusive color-contrast result concerned two decorative checkmark spans containing non-text characters. Computed-color checks measured approximately 19.89:1 for selected white checkmarks against zinc-950, 10.46:1 for unselected zinc-700 labels against white, 4.83:1 for zinc-500 control borders against white, 4.62:1 for the search border/placeholder against zinc-50, and 7.29:1 for violet-700 focus outlines against white. These are scoped rendered-color measurements, not verification of every possible consumer theme or state.

Compiled CSS inspection placed all seven `motion-safe` rules under `(prefers-reduced-motion: no-preference)`. Reduced motion was not enabled for a manual visual check; that remains open.

### Lighthouse reported by Travis

Travis reported a score of 98 and one finding, "Document does not have a main landmark." The exact category, audited URL, and report artifact were not recorded. Preserve this as a user-reported observation rather than a reproducible score claim.

The collection renders a section; the host page owns its main landmark. Inspect the audited page before deciding whether its demo or Storybook wrapper needs an adjustment. No main landmark was added to the reusable component, and no Lighthouse finding is claimed as fixed.

None of these results establishes WCAG conformance or final implementation approval. Remaining review items are below.

## November 4, 2026 — reduced motion and result wording refinement

After the checkpoint above, Travis enabled `prefers-reduced-motion: reduce` through Chrome DevTools and confirmed that the requested card/arrow motion stopped and the component still worked. This completes the previously open manual reduced-motion check for that local setup.

Travis then requested that screen readers announce "out of" instead of "slash." ChatGPT retained the compact visual count, such as `3 / 6 items shown`, inside an `aria-hidden` span and added a screen-reader-only sentence, `3 out of 6 items shown`, within the existing atomic status region. The readable sentence is exposed to assistive technology; the visual duplicate is hidden from it.

The earlier NVDA quotes document the pre-change version. Recheck the new wording in NVDA + Chrome for matching results, zero results, and Clear; the previous manual checks do not establish that this refinement has been heard correctly. Search/filter matching and focus behavior were not changed.

Local verification of this refinement: 23 component tests and 10 CI-policy tests passed, along with formatting of the five changed files and the TypeScript/Vite build. New announcement cases cover empty, single-item, and multiple-item collections; existing search/filter assertions now check the readable count wording. This round did not repeat the local Storybook build or manual NVDA check.

## Current review checklist

- [ ] Walk through the typed API and explain the component's responsibilities.
- [ ] Inspect the search/category logic, normalization, and stable keys.
- [ ] Decide whether the card design and visual language feel like your work.
- [ ] Review each test and identify missing user behavior.
- [ ] Open every Storybook story and inspect its Docs page.
- [x] Check keyboard focus visibility and tab order manually in the local example.
- [x] Check screen-reader labels, group selection, count announcements, focus restoration, headings, and card-link semantics in Default and Multi Select Labels with NVDA + Chrome.
- [x] Check 320px reflow and 200% browser zoom locally.
- [x] Record the scoped rendered contrast results and compiled reduced-motion CSS inspection above.
- [x] Perform a manual visual check with reduced motion enabled in Chrome.
- [ ] Recheck the updated "out of" result announcement with NVDA + Chrome after search, zero results, and Clear.
- [x] Record the reported edits, decisions, and local checks in AI_USAGE.md.
- [x] Configure branch protection on `develop` and `main`; confirm the exposed required-check settings.
- [ ] Finish human review of the CI-only guard and source/test implementation.
- [ ] Approve a reviewed version before portfolio integration or presenting it as production-ready work.

Human implementation approval: **not yet recorded**.
