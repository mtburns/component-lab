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
const multipleProps: SearchableCollectionProps<Item> = {
  ...props,
  filter: { ...props.filter!, selection: 'multiple' },
};

describe('SearchableCollection user behavior', () => {
  it.each(['single', 'multiple'] as const)(
    'has no axe-detected structural violations in %s mode',
    async (selection) => {
      const { container } = render(
        <main>
          <h1>Component test</h1>
          <SearchableCollection
            {...props}
            filter={{ ...props.filter!, selection }}
          />
        </main>,
      );
      // jsdom has no rendered layout. Contrast must be checked in a real browser.
      const results = await axe.run(container, {
        rules: { 'color-contrast': { enabled: false } },
      });
      expect(
        results.violations.map(({ id, nodes }) => ({
          id,
          count: nodes.length,
        })),
      ).toEqual([]);
    },
  );

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

  it('matches any selected label and restores all items when the last is unchecked', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...multipleProps} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.queryByRole('checkbox', { name: 'All' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Code' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    await user.click(screen.getByRole('checkbox', { name: 'Design' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('2 / 3 items shown');
    expect(screen.getByRole('checkbox', { name: 'Code' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Design' })).toBeChecked();
    expect(
      screen.queryByRole('heading', { name: 'Keyboard forms' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Code' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Component color tokens' }),
    ).toBeVisible();
    await user.click(screen.getByRole('checkbox', { name: 'Design' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: 'Clear filters' }),
    ).toBeDisabled();
  });

  it('requires every search term within the union of selected labels', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...multipleProps} />);
    await user.click(screen.getByRole('checkbox', { name: 'Code' }));
    await user.click(screen.getByRole('checkbox', { name: 'Access' }));
    await user.type(screen.getByRole('searchbox'), 'comp caf');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Café component patterns' }),
    ).toBeVisible();
    await user.type(screen.getByRole('searchbox'), ' missing');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 / 3 items shown');
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'color');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Design' }));
    expect(
      screen.getByRole('heading', { name: 'Component color tokens' }),
    ).toBeVisible();
  });

  it('clears query and every checkbox and restores focus to search', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...multipleProps} />);
    await user.click(screen.getByRole('checkbox', { name: 'Code' }));
    await user.click(screen.getByRole('checkbox', { name: 'Design' }));
    await user.type(screen.getByRole('searchbox'), 'component');
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('searchbox')).toHaveFocus();
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).not.toBeChecked();
    }
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: 'Clear filters' }),
    ).toBeDisabled();
  });

  it('supports Tab and Space for independent checkbox selections', async () => {
    const user = userEvent.setup();
    render(<SearchableCollection {...multipleProps} />);
    expect(
      screen.getByRole('group', { name: 'Topic' }),
    ).toHaveAccessibleDescription(
      'Choose any combination. No labels selected shows all items.',
    );
    await user.tab();
    expect(screen.getByRole('searchbox')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Code' })).toHaveFocus();
    await user.keyboard('[Space]');
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Access' })).toHaveFocus();
    await user.keyboard('[Space]');
    expect(screen.getByRole('checkbox', { name: 'Code' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Access' })).toBeChecked();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    await user.keyboard('[Space]');
    expect(screen.getByRole('checkbox', { name: 'Access' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Access' })).toHaveFocus();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('ignores removed labels while retaining other valid selections', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SearchableCollection {...multipleProps} />);
    await user.click(screen.getByRole('checkbox', { name: 'Code' }));
    await user.click(screen.getByRole('checkbox', { name: 'Design' }));
    rerender(
      <SearchableCollection
        {...multipleProps}
        filter={{
          ...multipleProps.filter!,
          options: [{ value: 'Design', label: 'Design' }],
        }}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Design' })).toBeChecked();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Component color tokens' }),
    ).toBeVisible();
    rerender(
      <SearchableCollection
        {...multipleProps}
        filter={{
          ...multipleProps.filter!,
          options: [{ value: 'Access', label: 'Access' }],
        }}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Access' })).not.toBeChecked();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: 'Clear filters' }),
    ).toBeDisabled();
  });

  it('uses only the first valid selection if changed to single-select mode', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SearchableCollection {...multipleProps} />);
    await user.click(screen.getByRole('checkbox', { name: 'Design' }));
    await user.click(screen.getByRole('checkbox', { name: 'Code' }));
    rerender(<SearchableCollection {...props} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Design' })).toBeChecked();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: 'Component color tokens' }),
    ).toBeVisible();
    await user.click(screen.getByRole('radio', { name: 'All' }));
    rerender(<SearchableCollection {...multipleProps} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).not.toBeChecked();
    }
  });

  it('keeps multi-select instances independent', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchableCollection {...multipleProps} title="First" />
        <SearchableCollection {...multipleProps} title="Second" />
      </>,
    );
    const first = within(screen.getByRole('region', { name: 'First' }));
    const second = within(screen.getByRole('region', { name: 'Second' }));
    await user.click(first.getByRole('checkbox', { name: 'Code' }));
    await user.click(first.getByRole('checkbox', { name: 'Design' }));
    await user.click(second.getByRole('checkbox', { name: 'Access' }));
    expect(first.getAllByRole('listitem')).toHaveLength(2);
    expect(second.getAllByRole('listitem')).toHaveLength(1);
    expect(first.getByRole('checkbox', { name: 'Access' })).not.toBeChecked();
    expect(second.getByRole('checkbox', { name: 'Code' })).not.toBeChecked();
  });
});
