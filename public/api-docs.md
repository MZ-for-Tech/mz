# Model Zero Research Reader

Base URL: https://www.mzfortech.com

The read-only research endpoint requires no credentials. Consult
[/robots.txt](https://www.mzfortech.com/robots.txt) for content usage preferences;
discoverability does not grant permission for AI training or AI input.

`GET /research/markdown` returns the English research overview as `text/markdown`.
The optional `path` query parameter selects a research page:

- `/research` or `/research/ar` for the English or Arabic overview.
- `/research/essays/{slug}` or `/research/papers/{slug}` for a published article.
- `/research/ar/essays/{slug}` or `/research/ar/papers/{slug}` for an available Arabic edition.

For example:
https://www.mzfortech.com/research/markdown?path=/research/essays/a-deep-reading-of-svd

Unknown articles and unavailable Arabic editions return HTTP 404. Find current
article URLs through the [research portal](https://www.mzfortech.com/research)
or [sitemap](https://www.mzfortech.com/sitemap.xml).

The [OpenAPI description](https://www.mzfortech.com/openapi.json) describes this
endpoint. There is no dedicated health endpoint. The contact form is intended
for visitor-submitted project briefs and is not part of this read-only API.
