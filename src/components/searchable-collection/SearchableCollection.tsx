'use client';

import { useId, useRef, useState, type Key, type ReactNode } from 'react';

export interface CollectionFilter<T> {
  label: string;
  /** Values must be unique and nonempty. The empty value means “all.” */
  options: readonly { value: string; label: string }[];
  getValue: (item: T) => string;
}

export interface SearchableCollectionProps<T> {
  title: string;
  description?: string;
  items: readonly T[];
  getKey: (item: T) => Key;
  getSearchText: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  filter?: CollectionFilter<T>;
  searchLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Client-side search over a small, already-loaded collection.
 * The consumer owns its data model and card markup; this component owns
 * query/filter state, controls, result announcements, and list structure.
 */
export function SearchableCollection<T>({
  title,
  description,
  items,
  getKey,
  getSearchText,
  renderItem,
  filter,
  searchLabel = 'Search this collection',
  searchPlaceholder = 'Try a name, topic, or keyword…',
  emptyMessage = 'No matches this time. Try another search or clear your filters.',
}: SearchableCollectionProps<T>) {
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  // If a consumer removes a filter option, fall back to “all” immediately.
  const activeCategory = filter?.options.some(({ value }) => value === category)
    ? category
    : '';
  const visibleItems = items.filter((item) => {
    const matchesCategory =
      !filter || !activeCategory || filter.getValue(item) === activeCategory;
    const text = normalize(getSearchText(item));
    return matchesCategory && terms.every((term) => text.includes(term));
  });
  const hasSelection = query.length > 0 || activeCategory !== '';

  return (
    <section aria-labelledby={`${id}-title`} className="w-full text-zinc-950">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id={`${id}-title`}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
              {description}
            </p>
          )}
        </div>
        <p
          role="status"
          aria-atomic="true"
          className="font-mono text-sm text-zinc-600"
        >
          <span className="font-semibold text-zinc-950">
            {visibleItems.length}
          </span>
          {' / '}
          {items.length} {items.length === 1 ? 'item' : 'items'} shown
        </p>
      </div>

      <div className="mb-7 rounded-2xl border border-zinc-300 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${id}-search`}
              className="mb-2 block text-sm font-semibold"
            >
              {searchLabel}
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="pointer-events-none absolute top-3.5 left-4 size-5 text-zinc-500"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                id={`${id}-search`}
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="min-h-12 w-full rounded-lg border border-zinc-500 bg-zinc-50 py-3 pr-4 pl-12 text-base placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-violet-700"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={!hasSelection}
            onClick={() => {
              setQuery('');
              setCategory('');
              searchRef.current?.focus();
            }}
            className="min-h-12 rounded-lg border border-zinc-400 px-5 py-3 text-sm font-semibold enabled:hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-violet-700 disabled:cursor-not-allowed disabled:text-zinc-500"
          >
            Clear filters
          </button>
        </div>

        {filter && filter.options.length > 0 && (
          <fieldset className="mt-5">
            <legend className="mb-3 text-sm font-semibold">
              {filter.label}
            </legend>
            <div className="flex flex-wrap gap-2">
              {[{ value: '', label: 'All' }, ...filter.options].map(
                (option) => (
                  <label key={option.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name={`${id}-category`}
                      value={option.value}
                      checked={activeCategory === option.value}
                      onChange={() => setCategory(option.value)}
                      className="peer sr-only"
                    />
                    <span className="inline-flex min-h-11 items-center rounded-full border border-zinc-500 bg-white px-4 py-2 text-sm font-medium text-zinc-700 peer-checked:border-zinc-950 peer-checked:bg-zinc-950 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-violet-700 hover:border-zinc-600">
                      {option.label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </fieldset>
        )}
      </div>

      {visibleItems.length > 0 ? (
        <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <li key={getKey(item)} className="min-w-0">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-400 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold">
            Nothing found. Plenty left to explore.
          </p>
          <p className="mx-auto mt-2 max-w-md leading-relaxed text-zinc-600">
            {emptyMessage}
          </p>
        </div>
      )}
    </section>
  );
}
