# Project Agents.md Guide for OpenAI Codex
This Agents.md file provides a brief overview of the project structure and about documenting changes

## Project Structure for OpenAI Codex Navigation
- `/src`: Source code containing the majority of the app
  - `/components`: Reusable React Components
  - `/features`: larger features & their services that have outgrown lib
  - `/lib`: Utilities, services, windowmanager, icons
  - `/locals`: localization files using i18n
  - `/screens`: Contains the various overwolf screens and overlays along with their specific components and pages

## Documenting changes
- The overall change should be in the root level CHANGELOG.md file.
- You should be documenting specific changes in the appropriate CHANGELOG.md files and referencing the overall change that it falls under that you put in the CHANGELOG.md file.

### Change Log Formatting:
- The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
