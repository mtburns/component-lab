import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import axe from 'axe-core';
import {
  SearchableCollection,
  type SearchableCollectionProps,
} from './SearchableCollection';

interface Item {
  id: string;
  name: string;
  topic: string;
}
const items: readonly Item[] = [
  { id: 'a', name: 'Café component patterns', topic: 'Code' },
  { id: 'b', name: 'Keyboard forms', topic: 'Access' },
  { id: 'c', name: 'Component color tokens', topic: 'Design' },
];
const props: SearchableCollectionProps<Item> = {
  title: 'Test collection',
  items,
  getKey: (item) => item.id,
  getSearchText: (item) => `${item.name} ${item.topic}`,
  filter: {
    label: 'Topic',
    options: ['Code', 'Access', 'Design'].map((value) => ({
      value,
      label: value,
    })),
    getValue: (item) => item.topic,
  },
  renderItem: (item) => <h3>{item.name}</h3>,
};

describe('SearchableCollection user behavior', () => {
  it('has no axe-detected structural violations in the test document', async () => {
    const { container } = render(
      <main>
        <h1>Component test</h1>
        <SearchableCollection {...props} />
      </main>,
    );
    // jsdom has no rendered layout. Contrast must be checked in a real browser.
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(
      results.violations.map(({ id, nodes }) => ({ id, count: nodes.length })),
    ).toEqual([]);
  });

  it('supports native radio navigation from the keyboard', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...props} />);
    await user.tab();
    expect(screen.getByRole('searchbox')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'All' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Code' })).toBeChecked();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('shows all items initially with an associated search label and result count', () => {
    render(<SearchableCollection {...props} />);
    expect(
      screen.getByRole('searchbox', { name: 'Search this collection' }),
    ).toHaveValue('');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('status')).toHaveTextContent('3 / 3 items shown');
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
  });

  it('matches all words regardless of case, accents, or extra spaces', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...props} />);
    await user.type(screen.getByRole('searchbox'), '  CAFE  PATTERNS ');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Café component patterns' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'Keyboard forms' }),
    ).not.toBeInTheDocument();
  });

  it('combines search and category filters instead of treating them as alternatives', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...props} />);
    await user.type(screen.getByRole('searchbox'), 'component');
    await user.click(screen.getByRole('radio', { name: 'Design' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Component color tokens' }),
    ).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('1 / 3 items shown');
  });

  it('clears both controls and returns focus to the search field', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...props} />);
    await user.type(screen.getByRole('searchbox'), 'component');
    await user.click(screen.getByRole('radio', { name: 'Design' }));
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('searchbox')).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('provides a usable no-results state and recovers after clearing', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...props} />);
    await user.type(screen.getByRole('searchbox'), 'unobtainium');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 / 3 items shown');
    expect(
      screen.getByText('Nothing found. Plenty left to explore.'),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('supports search without category controls', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...props} filter={undefined} />);
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'keyboard');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('keeps multiple instances independent, including radio-group names', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchableCollection {...props} title="First" />
        <SearchableCollection {...props} title="Second" />
      </>,
    );
    const first = within(screen.getByRole('region', { name: 'First' }));
    const second = within(screen.getByRole('region', { name: 'Second' }));
    await user.click(first.getByRole('radio', { name: 'Code' }));
    expect(first.getAllByRole('listitem')).toHaveLength(1);
    expect(second.getAllByRole('listitem')).toHaveLength(3);
    expect(second.getByRole('radio', { name: 'All' })).toBeChecked();
    expect(first.getByRole('searchbox').id).not.toBe(
      second.getByRole('searchbox').id,
    );
  });

  it('updates results from new item props without stale duplicated state', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SearchableCollection {...props} />);
    await user.type(screen.getByRole('searchbox'), 'component');
    rerender(
      <SearchableCollection
        {...props}
        items={[
          ...items,
          { id: 'd', name: 'Component testing', topic: 'Code' },
        ]}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('status')).toHaveTextContent('3 / 4 items shown');
  });

  it('falls back to all items if the selected category is removed from configuration', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SearchableCollection {...props} />);
    await user.click(screen.getByRole('radio', { name: 'Code' }));
    rerender(
      <SearchableCollection
        {...props}
        filter={{
          ...props.filter!,
          options: [{ value: 'Design', label: 'Design' }],
        }}
      />,
    );
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('supports a completely different data model and non-title search fields', async () => {
    const user = userEvent.setup();
    render(
      <SearchableCollection
        title="Materials"
        items={[
          { sku: 12, color: 'Orange' },
          { sku: 18, color: 'Purple' },
        ]}
        getKey={(item) => item.sku}
        getSearchText={(item) => item.color}
        renderItem={(item) => <p>{item.color}</p>}
      />,
    );
    await user.type(screen.getByRole('searchbox'), 'purple');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Purple')).toBeVisible();
  });
});
