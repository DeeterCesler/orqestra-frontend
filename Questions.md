# Question

**Explain how you would optimize for performance of a Vue.js based application that renders a large list of items (e.g. 10,000 rows in a table). What techniques/Vue.js features would you use to ensure smooth scrolling and responsiveness? Please be as detailed as possible.**

---

# Answer

Assuming this is an infinite scrolling feed (like Instagram or [Satlantis](https://www.satlantis.io/)).

---

## 🔹 Big Items

- **Virtual Scrolling (Windowing)**  
  Use libraries like `vue-virtual-scroller` to render only visible items in the viewport. This keeps the DOM lightweight and scroll performance high.

- **Batched / Paginated Fetching**  
  Fetch chunks of data (e.g. 100–200 rows) instead of all at once. Use scroll thresholds (e.g. 15 rows from the bottom) to trigger the next batch using `requestAnimationFrame`.

- **Lazy Load Media per Row**  
  Use `loading="lazy"` or Vue directives (`v-lazy`, `IntersectionObserver`) to load images/videos only when in view.

- **Throttle Scroll and Input Events**  
  Throttle scroll handlers (ideally using a custom one with requestAnimationFrame for 1 callback per frame) to avoid blocking the main thread and maintain smooth interactions.

- **Prefetch Next Batch in Idle Time**  
  Use `requestIdleCallback` or background workers to fetch future rows when the browser is idle.

- **Defer Non-Essential UI**  
  Delay rendering of toolbars, filters, or sidebars using `nextTick()` or `setTimeout()` until after the list is visible.

---

## 🔸 Lesser Items

- **Use WebP or AVIF for Images**  
  If you're showing media, switching to next-gen formats reduces payload size and speeds up rendering — especially in feeds.

- **Use `keep-alive` for Non-List Components**  
  Prevent re-rendering of persistent components like navbars, filters, or side panels.

- **Memoize Expensive Computations**  
  Use `computed` or memoization to avoid recalculating filtered/sorted lists on each render.

- **Cache Shared Data (e.g. Logos or Row Assets)**  
  If multiple rows reuse the same image or data, cache it client-side to avoid repeated fetches.

- **Use `v-for` with Unique `:key`**  
  Helps Vue efficiently track DOM updates via virtual DOM diffing.

- **Avoid Deep Reactivity**  
  Use shallow refs or `markRaw()` to avoid excessive reactivity on large, deeply nested data.

- **Provide Actual Pagination as a Fallback**  
  Offer a paged experience as a fallback for users with limited device or browser performance.

- **Fixed Height for Rows and Items**  
  Helps the virtual scroller calculate how many rows fit in view, avoids layout thrashing, and keeps scroll buttery-smooth.

- **Skeleton Framing**  
  Show placeholder skeleton UIs while content loads to improve perceived performance and prevent layout shifts.

- **Use `Object.freeze()` on Static Data**  
  Prevents Vue from making static objects reactive. Saves memory and reduces render overhead for large datasets.

- **Use `v-show` Instead of `v-if` Where Possible**  
  `v-if` adds/removes DOM nodes, which is costly. `v-show` simply toggles visibility via CSS — faster when toggling frequently.

- **Apply `will-change: transform` on Scroll Containers**  
  Tells the browser to optimize rendering for scroll/position changes, enabling smoother, GPU-accelerated scrolling.

- **Optimize Bundle Size with Dynamic Imports**  
  Use `import()` to lazy-load components related to virtual scrolling or large list logic so they’re only loaded when needed. This keeps your main bundle smaller and improves initial page load time. (May have limited benefit if the component is used immediately on page load and not behind a route or condition.)
