# Instructions for AI coding assistants

This file is for AI coding assistants (Claude Code, Codex, Copilot, Cursor and others) working in this repository. People should follow it too.

1. Before your first change in a session, read `ENGINEERING.md` in full. It holds Senva's engineering standards for security, privacy, architecture, documentation and workflow, and they apply to every change. Section 9 has the rules specific to AI assistants.
2. Read `README.md` to learn how this site is built before you change it.
3. To change these instructions, edit `AGENTS.md` or `ENGINEERING.md`, never `CLAUDE.md`.

## This repository

- It holds the public website senvahealth.com: plain HTML, CSS and JavaScript in `public/`. `_build/build_site.py` (Python 3, standard library only) generates the five pages, `public/assistant.js` and `public/sitemap.xml`. `public/styles.css`, `public/site.js`, the fonts and the images are edited directly.
- Page text and structure are in `_build/build_site.py` and the `_build/*.main.html` files.
- Email addresses, the form address, the LinkedIn links, the questionnaire link and the analytics switch are in `_build/config.json`. Never hard-code them. Links to research and partner sites are written in the page text.
- The repository is public: anyone can read everything in it, including its history.
- statichost.eu publishes the site from `main`, so pushing to `main` is a production deployment. Commit when you're asked to, but always ask before pushing.
- Never edit the generated files by hand. Change `_build/`, then rebuild with `python3 _build/build_site.py`.
- Styling is in `public/styles.css`, with the brand tokens at the top. Behaviour is in `public/site.js`. Pages load both with a version taken from their contents, so rebuild after editing either.
- Security headers are in `public/_headers`. Never weaken them.
- Build the preview with placeholders with `python3 _build/build_site.py ../senva-preview --preview`. It must never be written inside this repository or published.

## Content

- Senva is the company; Senva Health is the at-home test kit.
- Write in British English.
- Senva Health is a wellness test: no medical claims and no diagnosis language.
- `ENGINEERING.md`, section 4, lists what is confidential, and the founders keep the detailed list. Ask before writing about any of it.
- Photos must be real, never AI-generated; icons and diagrams drawn as SVG are fine. Photos must not show:
  - barcodes or sample numbers;
  - screens with data;
  - volunteers' details;
  - anyone who hasn't agreed to appear.

  Remove location and camera data (EXIF) from photos before committing them.

## Before you finish

- Rebuild, and check that the build reports no errors.
- Check every changed page at phone (390 px) and desktop (1280 px) widths, with no errors in the browser console.
- Check that links and the question helper work, and that the forms show their error and thank-you messages, without sending a real sign-up: block requests to formspree.io in the browser's developer tools. Only a founder sends a test sign-up to the live form, and deletes it afterwards.
- For layout or script changes, run Lighthouse. Every page must score 95 or more in every category on phone and desktop, except SEO on `404.html`, which is deliberately not indexed.
- If you can't run one of these checks, say which, so a founder can.
- Update `README.md` and any other affected documentation.
- Summarise what changed, why, and how you checked it.

## Current gaps

These predate the standards. Fix each one in a change of its own.

- **Waiting list:** it runs on Formspree, in the USA under the EU standard contractual clauses. It moves to an EU service before launch.
- **Security headers:** `public/_headers` has no Strict-Transport-Security header or content security policy yet. A policy needs a hash for the inline script in each page head. It also needs the hero's inline `style` attributes moved into classes first.
- **Build script:** `_build/build_site.py` has no type hints, and most functions lack docstrings. It also has long functions and long lines.
- **Translation:** the site is English only, and its text isn't yet separated for translation.
- **Automated checks:** the checks above are run by hand, not yet in the repository.
- **Preview labels:** the preview placeholders in `_build/build_site.py` contain internal questions. Use neutral labels there and keep the questions in `CONTENT-NEEDED.md`.
- **docs folder:** there is no `docs/` folder yet. It needs a first decision record, `docs/services.md` (including the approved AI tools) and `docs/data-flow.md` for the waiting list.
