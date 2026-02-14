# ImageNet Taxonomy Explorer

1. Download and parse ImageNet taxonomy XML.
2. Transform hierarchical XML into linear tuples `(string, number)`.
3. Store tuples in PostgreSQL.
4. Reconstruct tree from linear DB data.
5. Display data in a UI with lazy loading, search, and virtualized rendering.

## Stack

React 19, Next.js 16, TypeScript, Prisma + PostgreSQL, Kiwi Orbit, Zustand, TanStack React Query, TanStack React Virtual, Zod, Docker Compose.

## Setup

```bash
npm install
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run ingest
npm run dev
```

Needs a `.env` with `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/imagenet?schema=public"`.

Open [http://localhost:3000](http://localhost:3000).

## How it works

### Ingestion

`scripts/ingest-imagenet.ts` downloads the ImageNet XML, walks the synset hierarchy, and flattens each node into a row:

```ts
{
  path: "ImageNet 2011 Fall Release > plant, flora, plant life > phytoplankton",
  name: "phytoplankton",
  size: 2,
  depth: 2
}
```

These go straight into a `Taxonomy` table in Postgres. The `path` string is the unique ID — it encodes the full lineage of each node.

### Tree reconstruction

There's no in-memory tree. When you expand a node, the API finds its children by querying rows one level deeper whose path starts with the parent's. Cheap and lazy — we only touch what's visible.

### UI

The tree is virtualized — all expanded nodes are flattened into one array, and only the ~30 rows near the viewport actually exist in the DOM. New children load automatically as you scroll (infinite scroll pattern, pages of 50).

Search works across the whole dataset. Clicking a result expands the right ancestors, fetches the pages where the target sits, and scrolls to it.

State lives in Zustand so each component only re-renders when the slice it reads changes.

### API

| Endpoint | What it does |
|---|---|
| `GET /api/tree/root` | Root node |
| `GET /api/tree/children?path=&limit=&offset=` | Paginated children |
| `GET /api/tree/node?path=` | Single node details |
| `GET /api/tree/position?parent=&child=` | Where a child sits in the sorted sibling list |
| `GET /api/search?q=` | Name search |

## Main design decisions

- Kept API read patterns simple and predictable.
- Used lazy loading + virtualization to handle arbitrarily large trees without DOM or network bottlenecks.
- Used Zustand over React Context to avoid unnecessary re-renders in the virtualized tree.

## What I focused on most

- Correct XML flattening into deterministic tuples.
- Avoiding full-tree transfer to frontend.
- Keeping model and API easy to reason about during review.

## What I am most proud of

- The end-to-end flow is straightforward to run: migrate, ingest, open app.
- Search integrates with tree exploration instead of being a disconnected list.
- The same linear DB model supports both backend reconstruction and incremental UI loading.

## Key trade-offs

- `path` string model is simple and assignment-aligned, but parent lookups rely on string operations instead of explicit `parentId`.
- `contains` search is fast to build but not as powerful as indexing for very large datasets.
- Zustand store functions that interact with the query cache receive `queryClient` as a parameter since Zustand stores live outside React.
