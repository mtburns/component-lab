# Searchable collection — implementation notes

## The problem

Small collections need search and filtering without making every consumer maintain another nearly identical implementation. A resource library and a spool inventory have different data and card markup, but share the same interaction.

This is new demonstration work. It does not reproduce a former client's proprietary implementation or claim a historical project outcome.

## The first slice

- Immediate text search across fields selected by the consumer.
- Optional single-category filtering, combined with the query.
- Case- and accent-insensitive matching. Every space-separated term must match somewhere in the searchable text.
- Result count, empty state, and clear action.
- A grid with consumer-provided card content.

## API decisions to review

`SearchableCollection<T>` accepts the consumer's existing data type. It needs:

| Prop                                               | Responsibility                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------ |
| `items`                                            | The already-loaded, readonly collection                                        |
| `getKey`                                           | A unique, stable React key for each item                                       |
| `getSearchText`                                    | Text fields to search; keeps assumptions about the model outside the component |
| `renderItem`                                       | A React node for an item; allows different card designs                        |
| `filter`                                           | Optional category label, unique/nonempty option values, and an accessor        |
| `title`, `description`                             | The collection's heading and optional introduction                             |
| `searchLabel`, `searchPlaceholder`, `emptyMessage` | Optional interface copy                                                        |

We can review whether these accessors are the right level of flexibility. They deliberately avoid requiring every collection to look like the demo resource data.

## State and behavior

The component stores only query and category. Visible results are derived from current props, so incoming data changes do not require an effect to synchronize another array. There is no memoization yet: a straightforward pass is appropriate for the small demonstration dataset. We should measure before optimizing.

Category matching is exact; query matching is a literal substring test per term. The implementation normalizes case and diacritics, not spelling or synonyms. It preserves original item order. If a selected option disappears from configuration, it behaves as “all.”

## Presentation and reuse

The demo uses Tailwind utilities, small decorative SVGs, and motion-safe hover effects. Decorative SVGs are hidden from assistive technology. The generic collection owns a responsive grid; the consumer owns each card's article, heading, link, and image semantics.

The second data-model story uses fictional print materials with numeric/string-independent keys, different fields, a different category vocabulary, and different card markup. It exercises the same component rather than a copied implementation.

## Accessibility decisions

- Semantic section with an associated h2; consumers should place it in a compatible heading hierarchy and provide h3 item headings where appropriate.
- Visible search label, native search input, and native radio inputs grouped by fieldset/legend.
- A polite status region announces counts without moving focus to the results.
- Clear resets both controls and focuses search; result changes do not otherwise steal focus.
- React `useId` separates labels and radio-group names for multiple instances.
- Visible focus indicators and 44px-or-larger main controls; decorative card motion is gated by `prefers-reduced-motion` through Tailwind's motion-safe variants.
- Control borders use darker colors to make input boundaries distinguishable.

These are design decisions, not proof of comprehensive WCAG conformance. Verify actual colors, focus, zoom/reflow, assistive technology behavior, and consumer markup in the integrated interface.

## Deliberate limits

This first version does not fetch data, manage loading/error requests, paginate, virtualize long lists, synchronize URL state, support multiple simultaneous categories, or expose controlled state. It is English-first sample UI. Large datasets, localization, and external state should be requirements-led extensions, not speculative additions.

## Next.js integration later

The collection is a client component. Keep item-accessor/render functions on its client side: functions are not serializable props passed from a Next.js server component. A small client wrapper can compose imported data with the collection. Server-provided data should be serializable. Include the component's source in Tailwind's content detection, and verify the actual page context after integration.

## Review checkpoint

Start with the props and the filtering expression. Confirm that each abstraction earns its place. Then follow one interaction from the native input to state, derived results, rendered cards, and count announcement. Finally review the tests and what they do not cover.

See [REVIEW.md](REVIEW.md) for actual checks and [AI_USAGE.md](../AI_USAGE.md) for contribution attribution.
