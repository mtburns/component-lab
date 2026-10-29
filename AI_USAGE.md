# AI collaboration record

## Working agreement

Travis owns the engineering decisions and final approval. AI can propose approaches, draft code, suggest cases, and help investigate failures. An AI-generated implementation and passing automated checks do not mean human review has happened.

The aim is to make development more efficient while keeping the result understandable and maintainable. We have not measured hours saved, and make no numerical productivity claim.

## October 29, 2026 — searchable collection, first slice

| Area                      | Contribution                                                                                                                                                                                                    | Status                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Goal and scope            | Travis requested generalized, reusable components with accessibility included from the beginning, a separate repo, Storybook explanations, and transparent AI use. He selected the searchable collection first. | User decisions confirmed in conversation             |
| API and implementation    | ChatGPT proposed a generic item type, accessor functions, a render function, internal query/category state, and derived results; drafted the code and visual demo.                                              | Partial review recorded below; no final approval     |
| Stories and documentation | ChatGPT drafted five stories, the problem/approach/tradeoffs, integration notes, and this record.                                                                                                               | Human swatch revision recorded below; review ongoing |
| Behavior checks           | ChatGPT drafted and ran automated tests, including search/filter combinations, reset/focus, instance isolation, keyboard simulation, and an unrelated item model.                                               | Recorded in docs/REVIEW.md                           |
| Revisions during drafting | ChatGPT added explicit focus restoration on clear, made removed categories fall back to all, isolated radio groups using React IDs, and strengthened control borders.                                           | AI changes; not claimed as human corrections         |
| Tooling investigation     | ChatGPT investigated an executor restriction on OS interface enumeration that affected Storybook's build. An executor-only fallback was used for static-build verification, outside the delivered project.      | Documented in docs/REVIEW.md                         |
| Human validation          | Travis will inspect the API, challenge decisions, adjust the implementation, and perform/confirm appropriate manual checks before approving it as a work sample.                                                | Local checks recorded below; final sign-off pending  |

## October 29, 2026 — source-control and CI-only clarification

Travis specified the workflow: feature branches from `main`, PR into `develop`, QA on `develop`, and a confirmed merge to `main`. He clarified that this repository has **no** staging or production deployment and must never deploy to or trigger the portfolio host. Component transfer to the portfolio is manual and reviewed in the separate repository.

ChatGPT updated the workflow for `develop`/`main`, removed credential persistence, and drafted a strict CI-only guard with tests and documentation. These are AI-assisted draft changes awaiting Travis's review. Repository branch protection has not been configured or represented as complete.

## October 29, 2026 — human review and multi-select request

- Travis reviewed the generic data/accessor/render-function separation and accepted its flexibility and portability. He added a required `swatch` field with hex color values to the filament fixtures and rendered a swatch inside each card without changing the collection API. ChatGPT suggested hiding the decorative swatch from assistive technology because the color name is already visible; that suggestion is included in this update, rather than attributed to Travis.
- Travis accepted all-term substring search after discussing examples: `violet` can match both PLA and PETG, while `violet PL` narrows to PLA. He preferred this balance of specificity and flexibility.
- Travis agreed with native controls for single selection and requested an additional multi-select example. ChatGPT drafted an opt-in `filter.selection: 'multiple'` mode, native checkbox pills, a Storybook example, and tests. ChatGPT proposed OR matching across selected categories, AND matching across query terms, and showing all items when no categories are selected. Travis subsequently confirmed the local multi-select behavior; the remaining implementation review and final approval are still outstanding.
- Travis reported running the initial local checks successfully (12 component tests passed) and confirmed Storybook was running. These reports do not constitute screen-reader testing or final approval.
- See docs/REVIEW.md for automated verification of the multi-select draft. Human implementation review is ongoing; screen-reader checks, contrast/reduced-motion verification, and approval for `main` remain pending. Local visual and keyboard results are recorded below.

## October 29, 2026 — local interaction and layout verification

- Travis confirmed the new multi-select example behaved as intended after checking multiple category selections and deselecting them. This supports the OR behavior proposed by ChatGPT; search continues to require every query term.
- Travis confirmed local keyboard navigation looked good after the requested checks: Tab/Shift+Tab, Space to toggle labels independently, visible focus, and Clear restoring search focus.
- Travis asked about adding arrow-key navigation to the multi-select labels. ChatGPT checked WAI's checkbox and radio guidance and recommended retaining native behavior for the small group. Travis accepted this decision: Tab/Shift+Tab and Space for checkboxes, native arrow navigation for single-select radios.
- Travis reported that responsive layout and zoom checks looked good after the requested 320px viewport and 200% browser zoom checks. These are local user-reported observations; no broader browser coverage or screen-reader verification is implied.
- ChatGPT updated this attribution record and docs/REVIEW.md from those reports. Passing checks and accepted interaction decisions do not constitute final approval for `main`; remaining review items stay open.

## How this helped

AI produced the repetitive project setup, proposed a first API and alternative-data demonstration, and drafted test scenarios and explanations in one working pass. This gives Travis concrete code to evaluate. The next step is his review, not a claim that the first draft is finished production code.

## Record future decisions

For each meaningful review round, add the actual date and:

1. What AI suggested or generated.
2. What Travis inspected and accepted, changed, or rejected, and why.
3. What verification ran and its result.
4. Any remaining limitations.

Use specific examples and commit references once available. Do not retroactively attribute AI revisions to Travis or record a review that has not occurred.
