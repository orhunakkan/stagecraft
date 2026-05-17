import { useState, useEffect } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'har-recording')!;

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

export function HarRecording() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProducts((await res.json()) as Product[]);
      setFetched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-6 text-sm text-zinc-500">
        <code className="rounded bg-zinc-100 px-1 text-xs">page.routeFromHAR()</code> replays a
        previously recorded HTTP archive, letting tests run against a real network snapshot without
        hitting live servers.
      </p>

      <div className="space-y-10">
        {/* ── HAR workflow explainer ────────────────────────────────────── */}
        <section aria-labelledby="har-flow-heading">
          <h2 id="har-flow-heading" className="mb-3 text-base font-semibold text-zinc-900">
            HAR recording workflow
          </h2>
          <ol className="space-y-2">
            {[
              {
                n: 1,
                text: 'Record a live session by calling page.routeFromHAR("products.har", { update: true }), navigate to this page, then stop recording.',
              },
              {
                n: 2,
                text: 'Replay offline: call page.routeFromHAR("products.har") without { update }. The HAR file is served instead of the real server.',
              },
              {
                n: 3,
                text: 'Selectively override: use page.route() after routeFromHAR() to intercept a specific endpoint with a mock response while replaying the rest from HAR.',
              },
            ].map(({ n, text }) => (
              <li key={n} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {n}
                </span>
                <p className="text-sm text-zinc-600">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Product catalog ───────────────────────────────────────────── */}
        <section aria-labelledby="products-heading">
          <h2 id="products-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Product catalog
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            This catalog fetches from{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">/api/products</code>. Record a HAR
            snapshot of this request, then replay it in CI without a running server.
          </p>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => void fetchProducts()}
              disabled={loading}
              data-testid="fetch-products"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Reload products
            </button>
            {fetched && (
              <span role="status" aria-live="polite" className="flex items-center text-xs text-zinc-400">
                {products.length} products loaded
              </span>
            )}
          </div>

          {loading && (
            <div role="status" aria-label="Loading products" className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
              Loading…
            </div>
          )}

          {error && (
            <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {products.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <article
                  key={p.id}
                  data-testid={`product-${p.id}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <p className="text-sm font-semibold text-zinc-900">{p.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{p.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-900">${p.price.toFixed(2)}</p>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        p.inStock
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {p.inStock ? 'In stock' : 'Out of stock'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
