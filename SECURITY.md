# Security

Report a vulnerability privately through GitHub's
[security advisory form](https://github.com/murathany7/reel-studio/security/advisories/new), not in a public issue.

The renderer serves the project folder on a local port while it renders, and `capture.mjs` opens the pages you point
it at. Releases are published from GitHub Actions after the full test suite passes on `main`, with npm provenance
when trusted publishing is set up.
