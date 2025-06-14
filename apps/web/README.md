# Dashboard Feature – Quick Reference

TL;DR
-----
One **HTTP request**, one **React Query cache entry**, zero duplicated data fetching. Keep it that way.

Architecture
------------
```
app/dashboard/page.tsx          ← client component wrapper only
lib/client/api/dashboard.ts     ← single `getAllDashboardData()` call → /api/dashboard
app/api/dashboard/route.ts      ← aggregates & returns `DashboardData` JSON
lib/server/services/dashboard.ts ← DB aggregation logic
```

Data Flow
---------
1. Browser navigates to `/dashboard`.
2. `page.tsx` renders `<DashboardClient />` (no server-side fetch).
3. Inside the client, React Query fires `GET /api/dashboard` once:
   ```ts
   const { data } = useQuery({
     queryKey: dashboardKeys.all(),
     queryFn: dashboardApi.getAllDashboardData,
   });
   ```
4. The endpoint authenticates via `auth.api.getSession` and calls `fetchDashboardData(userId)` in the service layer.
5. Aggregated `DashboardData` JSON is returned and cached; slices are exposed through a light context (`DashboardContextProvider`).

Rules for Future Work
---------------------
• **Single Endpoint:** All dashboard widgets must share `/api/dashboard`   
  If you need an extra field, extend the DTO — do **not** bolt on new routes.

• **No SSR Fetching:** Keep `page.tsx` a *pure* client shell. Rendering must never block on DB calls.

• **Typed DTO:** The shape is defined in `lib/client/api/dashboard.ts`. Expand it, don't replace it with `any`.

• **React Query Keys:** Use `dashboardKeys.all()` for invalidation. Avoid bespoke keys – consistency matters.

• **Context Guardrails:** The dashboard context is read-only. If you add mutations, call a server **action** or dedicated route and then `router.refresh()` / `invalidateQueries`.

Performance Cheat-Sheet
-----------------------
• One DB round-trip per page load.  
• No hydration bloat – data isn't embedded in HTML.  
• React Query deduplicates requests when multiple widgets mount quickly.

Copy Pasta Checklist
--------------------
When you spin up another feature page:
1. Create a single `/api/{feature}` route.
2. Expose a small typed `FeatureData` DTO in `lib/client/api/{feature}.ts`.
3. Use a lightweight context **only** if multiple widgets need the same slice.
4. No double-fetching. Ever.

---
Maintain this simplicity or get publicly shamed in commit history.  