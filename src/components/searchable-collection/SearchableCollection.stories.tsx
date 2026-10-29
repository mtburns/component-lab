import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchableCollection } from './SearchableCollection';
import { ResourceCard } from '../../demo/ResourceCard';
import {
  resources,
  resourceFilter,
  resourceSearchText,
  type Resource,
} from '../../demo/resources';

const meta = {
  title: 'Components/Searchable collection',
  component: SearchableCollection<Resource>,
  parameters: {
    docs: {
      description: {
        component: `A reusable client-side collection. Search and category filtering are independent of the item data model and card presentation.

**Problem:** Make a small set of content easy to explore without building a one-off search UI for every page.

**Approach:** Pass items, stable keys, searchable text, optional category configuration, and a render function. The collection manages its own query and selected category. Results are derived from props on each render; they are not duplicated in state.

**Tradeoffs:** One category at a time; all search terms must match; accents and case are ignored. This first version assumes a small, already-loaded dataset. It does not provide remote search, pagination, URL state, or virtualization.

**Accessibility by design:** Visible input label, native radio group, a polite result count, list semantics, visible keyboard focus, and focus returned to search when filters are cleared. The consumer owns accessible card markup. Automated checks are useful evidence, not a WCAG conformance claim.

**AI collaboration:** ChatGPT proposed the API, implementation, stories, and tests. Travis chose the searchable collection, separate repository, stack, and review workflow. Implementation review, screen-reader checks, and approval for main by Travis are pending. This repository has no deployment destination. See AI_USAGE.md and docs/REVIEW.md in the repository.

Try the stories below, including an unrelated product data model using the same collection.`,
      },
    },
  },
  args: {
    title: 'A few things worth keeping.',
    description: 'References for people who build the web.',
    items: resources,
    getKey: (resource) => resource.id,
    getSearchText: resourceSearchText,
    filter: resourceFilter,
    renderItem: (resource) => <ResourceCard resource={resource} />,
  },
  argTypes: {
    items: { control: false },
    getKey: { control: false },
    getSearchText: { control: false },
    filter: { control: false },
    renderItem: { control: false },
  },
} satisfies Meta<typeof SearchableCollection<Resource>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SearchWithoutCategories: Story = {
  args: { filter: undefined, title: 'Just search.' },
  parameters: {
    docs: {
      description: {
        story:
          'Category filters are optional. The component keeps the same search and list behavior.',
      },
    },
  },
};

export const EmptyCollection: Story = {
  args: {
    items: [],
    title: 'An empty shelf.',
    emptyMessage: 'This collection has no items yet. Check back later.',
  },
};

export const SingleItem: Story = { args: { items: resources.slice(0, 1) } };

interface PrintMaterial {
  sku: string;
  name: string;
  material: string;
  color: string;
}

const materials: readonly PrintMaterial[] = [
  { sku: 'pla-violet', name: 'Everyday PLA', material: 'PLA', color: 'Violet' },
  { sku: 'pla-slate', name: 'Matte PLA', material: 'PLA', color: 'Slate gray' },
  {
    sku: 'petg-amber',
    name: 'Workshop PETG',
    material: 'PETG',
    color: 'Amber',
  },
];

export const DifferentDataModel: Story = {
  render: () => (
    <SearchableCollection
      title="What's on the spool shelf?"
      description="Fictional sample inventory. Different data and markup; the same search and filter component."
      items={materials}
      getKey={(material) => material.sku}
      getSearchText={(material) =>
        `${material.name} ${material.material} ${material.color}`
      }
      filter={{
        label: 'Material',
        options: [
          { value: 'PLA', label: 'PLA' },
          { value: 'PETG', label: 'PETG' },
        ],
        getValue: (material) => material.material,
      }}
      renderItem={(material) => (
        <article className="rounded-xl border border-zinc-300 bg-white p-6">
          <p className="font-mono text-xs text-zinc-600">{material.sku}</p>
          <h3 className="mt-3 text-xl font-semibold">{material.name}</h3>
          <p className="mt-2 text-zinc-600">
            {material.color} / {material.material}
          </p>
        </article>
      )}
    />
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'A separate TypeScript model with SKU keys and entirely different card markup. This is the reuse check, not a second implementation.',
      },
    },
  },
};
