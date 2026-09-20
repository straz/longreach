/// <reference types="vite/client" />

// @rollup/plugin-yaml turns each .yml file into an ES module at build time, so
// the scenario content in content/ is frozen into the bundle: no YAML parser
// ships to the browser and there is no runtime fetch (docs/PLAN.md §4.3).
// The shape is asserted by scripts/check-content.ts, not by the type system.
declare module '*.yml' {
  const data: unknown
  export default data
}
