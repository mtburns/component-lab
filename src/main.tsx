import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SearchableCollection } from './components/searchable-collection';
import { ResourceCard } from './demo/ResourceCard';
import {
  resources,
  resourceFilter,
  resourceSearchText,
} from './demo/resources';
import './styles.css';

function App() {
  return (
    <div className="min-h-screen bg-[#f7f6f2] font-sans text-zinc-950 selection:bg-violet-200">
      <a
        href="#collection"
        className="sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:not-sr-only focus:rounded-lg focus:bg-white focus:p-4 focus:outline-2 focus:outline-violet-700"
      >
        Skip to collection
      </a>
      <header className="border-b border-zinc-300">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
          <a
            href="#"
            className="rounded-sm font-mono text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700"
          >
            <span aria-hidden="true" className="mr-2 text-violet-700">
              &lt;/&gt;
            </span>
            component<span className="font-normal text-zinc-600">Lab</span>
          </a>
          <a
            href="https://www.burnsgd.com/"
            className="rounded-sm text-sm text-zinc-700 underline underline-offset-4 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700"
          >
            Travis Burns <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pt-14 pb-20 sm:px-10 sm:pt-20">
        <div className="mb-14 max-w-3xl">
          <p className="mb-5 font-mono text-xs font-semibold tracking-widest text-violet-800 uppercase">
            // A work in progress. On purpose.
          </p>
          <h1 className="text-5xl leading-[1.08] font-semibold tracking-[-0.05em] sm:text-7xl">
            Small pieces.
            <br />
            Plenty of possibility<span className="text-violet-700">.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
            Useful interfaces, a little personality, and code worth talking
            about. Welcome to the workshop.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-700">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-violet-700"
            />
            01 / Searchable collection
          </div>
        </div>
        <div id="collection" className="scroll-mt-8">
          <SearchableCollection
            title="A few things worth keeping."
            description="A small collection of references for people who build the web. Search a topic or take a look around."
            items={resources}
            getKey={(resource) => resource.id}
            getSearchText={resourceSearchText}
            filter={resourceFilter}
            renderItem={(resource) => <ResourceCard resource={resource} />}
            searchPlaceholder="Try React, motion, or keyboard…"
          />
        </div>
      </main>
      <footer className="border-t border-zinc-300 px-6 py-7 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 font-mono text-xs leading-relaxed text-zinc-600">
          <p>Made with care. And a healthy amount of coffee.</p>
          <p>Component Lab / Travis Burns</p>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
