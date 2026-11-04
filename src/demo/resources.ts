export interface Resource {
  id: string;
  title: string;
  summary: string;
  category: 'Design' | 'Development' | 'Accessibility';
  tags: readonly string[];
  href: string;
  motif: 'layers' | 'brackets' | 'orbit' | 'grid' | 'path' | 'switch';
}

// Real public references, not claims about client work or authored resources.
export const resources: readonly Resource[] = [
  {
    id: 'react',
    title: 'Think in components.',
    summary:
      'Break an interface into pieces that make sense. Then give each piece a clear job.',
    category: 'Development',
    tags: ['React', 'Components'],
    href: 'https://react.dev/learn/thinking-in-react',
    motif: 'brackets',
  },
  {
    id: 'composition',
    title: 'Make room for change.',
    summary:
      'Composition patterns that let the next developer extend your work without a rewrite.',
    category: 'Development',
    tags: ['TypeScript', 'Composition'],
    href: 'https://react.dev/learn/passing-props-to-a-component',
    motif: 'layers',
  },
  {
    id: 'keyboard',
    title: 'Leave the mouse alone.',
    summary:
      'Build interactions that make sense with a keyboard, too. Start with familiar behavior.',
    category: 'Accessibility',
    tags: ['Keyboard', 'Interaction'],
    href: 'https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/',
    motif: 'path',
  },
  {
    id: 'tokens',
    title: 'A little consistency.',
    summary:
      'A shared visual vocabulary makes an interface easier to build, maintain, and recognize.',
    category: 'Design',
    tags: ['Tokens', 'Tailwind'],
    href: 'https://tailwindcss.com/docs/theme',
    motif: 'grid',
  },
  {
    id: 'forms',
    title: 'Forms with manners.',
    summary:
      'Labels, instructions, and feedback that help people get where they are going.',
    category: 'Accessibility',
    tags: ['Forms', 'Semantic HTML'],
    href: 'https://www.w3.org/WAI/tutorials/forms/',
    motif: 'switch',
  },
  {
    id: 'motion',
    title: 'Move with a purpose.',
    summary:
      'A small transition can explain a change. Make it helpful, and offer a quieter experience.',
    category: 'Design',
    tags: ['Motion', 'Reduced motion'],
    href: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html',
    motif: 'orbit',
  },
];

export const resourceFilter = {
  label: 'Browse by discipline',
  options: [
    { value: 'Design', label: 'Design' },
    { value: 'Development', label: 'Development' },
    { value: 'Accessibility', label: 'Accessibility' },
  ],
  getValue: (resource: Resource) => resource.category,
};

export const resourceSearchText = (resource: Resource) =>
  [resource.title, resource.summary, resource.category, ...resource.tags].join(
    ' ',
  );
