# Project Agents.md
This Agents.md file provides a brief overview of the project structure and about documenting changes

## Project Structure for OpenAI Codex Navigation
- `/src`: Source code containing the majority of the app
  - `/components`: Reusable React Components
  - `/features`: larger features & their services that have outgrown lib
  - `/lib`: Utilities, services, windowmanager, icons
  - `/locals`: localization files using i18n
  - `/screens`: Contains the various overwolf screens and overlays along with their specific components and pages

## Styling & CSS Considerations
- Sizing, spacing ect should be done using em and rem
- Colors for text and backgrounds should be set using the css variables defined in `src/app/shared/root.cs` and `src/screens/desktop/components/styles/themes.css`
- New colors required to style the application should be made theme compatible by updating `src/app/shared/root.cs` and `src/screens/desktop/components/styles/themes.css`
- Be aware of contrast and color of the components on each theme, text should be styled so that it is readable on all themes (e.g. usually use white text on dark themes and a dark gray or off black for light themes)
- Style using tailwind from here on out. We can slowly incremently update the existing code to use tailwind where needed. We will still use custom css where needed as well.

## Documenting changes
- The overall change should be in the root level CHANGELOG.md file.
- You should be documenting specific changes in the appropriate CHANGELOG.md files and referencing the overall change that it falls under that you put in the CHANGELOG.md file.

## Localization
- Text strings displayed to the user should be localized and localization files should be updated accordingly `/src/locales/`
- Try not to duplicate already localized strings, if something is used alot and in multiple places it should be moved to the `common.json` if it is not already there. Its uses around the application should also be updated accordingly.

## .ts/.tsx and React Code
- JSDOCS style documentation should be added if the function/method is not basic. Use well thoughtout and tasteful comments, do not over comment.
- Methods and Functions should be documented like so:
  - ```
  /**
   * Foo takes a and b and does something to them to return c
   * @param a The first parameter that is needed for something
   * @param b The second parameter that does something
   * @returns The result of a and b is TypeC
   */
  function Foo(a: TypeA, b: TypeB): TypeC {...} 
  ```
- Try not to duplicate code when possible especially when it is available in the same component. If you find that code is getting repeated in the same component, then you should consider extracting the logic to a function that they both can call. 

### Render Efficiency (minimal)
- **Stable identities only:** Pass primitives/IDs; avoid inline `{}`/`[]`/`()=>{}` to memoized children; wrap leaves in `React.memo`; memoize **only** handlers/values you pass down (`useCallback`/`useMemo`); memoize context `value`; use stable keys.
- **Scope & defer work:** Keep state where it’s used (or lift to prevent cascades), virtualize large lists, lazy-load heavy branches, and guard expensive derivations with `useMemo`.


## Component Rules
- Components must be modular, maintainable, easy to use: simple prop API, composition-first, a11y complete (keyboard + ARIA), ref-forwarding, Tailwind variants/sizes, minimal local state, memoize where it matters, and ship a usage snippet + gotchas.


### Change Log Formatting:
- The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
