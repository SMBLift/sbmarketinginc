# sbmarketinginc.com

Static rebuild of the S.B. Marketing website. Plain HTML + Tailwind CDN + self-hosted Metropolis font. No build step: every page is a file.

## Deploy (Cloudflare Pages)

- Connect this repo in Cloudflare Pages (no build command, output dir = `/`).
- `staging` branch = preview URL for review. `main` = production.
- `_redirects` handles www to apex. `_headers` sets security + caching headers.
- After DNS cutover: submit `sitemap.xml` in Search Console.

## Editing

- Page content lives in each `*/index.html`. The header/footer are identical on every page: if you change one, change them all (they are byte-identical copies).
- Home page (`index.html`) is the master shell: the blog and SEO generators read its header/footer at build time.

## Blog: adding a post

1. Write the body as `source/blog-data/bodies/<slug>.html` (or `.md`).
2. Add an entry to `source/blog-data/posts.json` (slug, title, date `YYYY-MM-DD`, author, image, og_image, description, excerpt).
3. Run `python3 ../tools/sb-blog-build.py` then `python3 ../tools/sb-seo-build.py` (refreshes post pages, blog index, sitemap).
4. Commit and push.

## Forms

Forms post to a Brevo Cloudflare Worker. Until the Worker exists, `data-worker="WORKER_URL"` and `TURNSTILE_SITE_KEY` are placeholders: replace both in `index.html` and `contact/index.html` when wiring up.

## Not in this repo

`source/` (gitignored) holds the extraction from the old WordPress site: SFTP credentials, DB dump, WP export, media mirror, reference screenshots. It stays local/Dropbox only.
