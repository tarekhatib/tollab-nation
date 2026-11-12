# glisse 0.5.0 (vendored)

Source of [glisse](https://github.com/0kzh/glisse) at tag `v0.5.0` (commit 433fc17), MIT licensed (see LICENSE).

Vendored only because `npm install` was blocked on the network it was added from.
The single local change: `index.ts` imports `styles.css` directly instead of Vite's `?inline` import.

To switch to the npm package:

1. `npm install glisse@0.5.0 --save-exact`
2. Delete this folder and the `"glisse"` entry under `paths` in `tsconfig.json`.
3. In `components/ui/LiquidGlass.tsx`, add `import "glisse/styles.css";`.
