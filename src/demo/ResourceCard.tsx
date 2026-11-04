import type { Resource } from './resources';

function Motif({ kind }: { kind: Resource['motif'] }) {
  const shared = 'fill-none stroke-current';
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 120"
      className={`h-full w-full ${shared}`}
      strokeWidth="2"
    >
      {kind === 'brackets' && (
        <>
          <path d="m93 28-35 32 35 32m54-64 35 32-35 32m-15-71-24 78" />
          <circle cx="205" cy="24" r="3" fill="currentColor" />
        </>
      )}
      {kind === 'layers' && (
        <>
          <path d="m120 17 61 28-61 28-61-28 61-28Zm-61 45 61 28 61-28M59 79l61 28 61-28" />
        </>
      )}
      {kind === 'path' && (
        <>
          <path d="M40 83h37V36h47v47h75" strokeDasharray="6 5" />
          <circle cx="40" cy="83" r="8" />
          <rect x="187" y="71" width="24" height="24" rx="5" />
          <path d="m155 78 7 5-7 5" />
        </>
      )}
      {kind === 'grid' && (
        <>
          {[0, 1, 2].flatMap((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={72 + col * 34}
                y={16 + row * 32}
                width="25"
                height="23"
                rx="5"
                fill={row === 1 && col === 1 ? 'currentColor' : 'none'}
              />
            )),
          )}
        </>
      )}
      {kind === 'switch' && (
        <>
          <rect x="64" y="32" width="112" height="56" rx="28" />
          <circle cx="144" cy="60" r="19" fill="currentColor" />
          <path d="M82 56h20m-20 8h14" />
        </>
      )}
      {kind === 'orbit' && (
        <>
          <ellipse
            cx="120"
            cy="60"
            rx="68"
            ry="24"
            transform="rotate(-25 120 60)"
          />
          <ellipse
            cx="120"
            cy="60"
            rx="45"
            ry="42"
            transform="rotate(25 120 60)"
          />
          <circle cx="120" cy="60" r="9" fill="currentColor" />
          <circle cx="178" cy="27" r="5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

const artColors: Record<Resource['category'], string> = {
  Development: 'bg-violet-100 text-violet-800',
  Design: 'bg-amber-100 text-amber-900',
  Accessibility: 'bg-emerald-100 text-emerald-900',
};

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-300 bg-white motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 motion-safe:hover:-translate-y-1 hover:shadow-lg">
      <div className={`h-36 p-3 ${artColors[resource.category]}`}>
        <div className="h-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105">
          <Motif kind={resource.motif} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-3 font-mono text-xs font-semibold tracking-wide text-zinc-600 uppercase">
          {resource.category}
        </p>
        <h3 className="text-xl leading-snug font-semibold tracking-tight">
          <a
            href={resource.href}
            className="rounded-sm underline decoration-transparent underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700"
          >
            {resource.title}{' '}
            <span
              aria-hidden="true"
              className="inline-block text-violet-700 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
            >
              ↗
            </span>
          </a>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">
          {resource.summary}
        </p>
        <ul
          aria-label="Topics"
          className="mt-6 flex list-none flex-wrap gap-2 p-0"
        >
          {resource.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
