# Project Agents.md Guide for OpenAI Codex
This Agents.md file provides a brief overview of the project structure and about documenting changes

## Project Structure for OpenAI Codex Navigation
- `/src`: Source code containing the majority of the app
  - `/components`: Reusable React Components
  - `/features`: larger features & their services that have outgrown lib
  - `/lib`: Utilities, services, windowmanager, icons
  - `/locals`: localization files using i18n
  - `/screens`: Contains the various overwolf screens and overlays along with their specific components and pages

## CSS Considerations
- sizing, spacing ect should be done using em and rem
- Colors for text and backgrounds should be set using the css variables defined in `src/app/shared/root.cs` and `src/screens/desktop/components/styles/themes.css`
- New colors required to style the application should be made theme compatible by updating `src/app/shared/root.cs` and `src/screens/desktop/components/styles/themes.css`

## Documenting changes
- The overall change should be in the root level CHANGELOG.md file.
- You should be documenting specific changes in the appropriate CHANGELOG.md files and referencing the overall change that it falls under that you put in the CHANGELOG.md file.

## Localization
- Text strings displayed to the user should be localized and localization files should be updated accordingly `/src/locales/`
- Try not to duplicate already localized strings, if something is used alot and in multiple places it should be moved to the `common.json` if it is not already there. Its uses around the application should also be updated accordingly.

## .ts/.tsx jsdocs comments
- JSDOCS style documentation should be added if the function/method is not basic. Use well thoughtout and tasteful comments, do not over comment.

### Change Log Formatting:
- The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
