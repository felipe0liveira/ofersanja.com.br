---
applyTo: "app/**"
---

1. **Atomic Design (Atomic Components):** Break down your UI into granular components. Start with Atoms (buttons, inputs, labels) that have no business logic—only styles and basic props. This ensures high reusability and visual consistency.
2. **Separation of Concerns (Container vs. Presentational):** Keep your UI components "dumb" (focusing only on rendering props) and move data fetching or state logic into Custom Hooks or parent "smart" components.
3. **Encapsulate HTTP Logic in Custom Hooks:** Never perform fetch or axios calls directly inside a component's useEffect. Create custom hooks (e.g., useUser, useProducts) to wrap this logic, making your API calls testable and reusable across the app.
4. **Leverage React Query (TanStack Query) for Server State:** Use React Query for asynchronous data. It handles complex tasks automatically, such as Caching, Loading/Error states, Prefetching, and Automatic Re-synchronization with the database.
5. **Prefer Server Components (Next.js App Router):** In Next.js, use Server Components by default to fetch data that doesn't require immediate client-side interactivity. This reduces the JavaScript bundle size sent to the browser and improves SEO.
6. **State Immutability:** Always treat state as immutable when using useState or useReducer. Never mutate an object's properties directly; use the spread operator or libraries like Immer to ensure React correctly detects changes and triggers re-renders.
7. **Avoid "Prop Drilling":** If you are passing data through five levels of components just to reach a leaf node, use React Context or global state management (like Zustand) for truly global data (e.g., user authentication or theme).
8. **Strategic Memoization:** Use useMemo and useCallback only when necessary—such as for expensive calculations or to maintain stable object references for sub-components. Overusing them can add unnecessary complexity without actual performance gains.
9. **Standardized Error Boundaries:** Implement Error Boundaries to catch JavaScript errors anywhere in their child component tree, preventing the entire application from crashing and providing a fallback UI for the user.
10. **Effect Dependency Honesty:** Always include all variables used inside a useEffect, useCallback, or useMemo in their dependency array. If you find yourself trying to "cheat" the linter, it’s usually a sign that your logic needs to be refactored.