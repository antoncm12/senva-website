# senvahealth.com

The Senva website. Plain HTML and CSS with no build step: the files are published as they are.

| File | What it is |
|---|---|
| `index.html` | Home page: how it works, the science in brief, our model, progress, news, team, questions, waiting-list form |
| `science.html` | Longer page on epigenetic clocks and biological age, with links to the research |
| `privacy.html` | Privacy notice for the waiting list |
| `404.html` | Shown for addresses that don't exist |
| `styles.css` | All styling |
| `site.js` | Phone menu, highlighting the menu item for the section in view, and the waiting-list form |
| `img/` | Photos, as WebP in two sizes each |
| `fonts/` | Self-hosted Cormorant Garamond and Outfit (SIL Open Font Licence, see `fonts/OFL.txt`), so no visitor data goes to Google Fonts |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Browser and phone icons |
| `logo.png` | Logo that search engines can show next to the site |
| `og.png` | Image shown when the link is shared, for example on LinkedIn |
| `robots.txt`, `sitemap.xml` | Tell search engines what to index |
| `statichost.yml` | Tells statichost.eu to publish the files without a build |

## Adding news

In `index.html`, find the News section, copy one `<article class="news-item">` block, paste it at the top of the list and edit the date, title and text.

- **LinkedIn post:** add `<p><a href="POST-URL">Read the post on LinkedIn</a></p>` inside the block. On LinkedIn, open the post, click the three dots and choose "Copy link to post". Links rather than embedded posts keep LinkedIn's tracking, and a cookie banner, off the site.
- **Photo:** save it in `img/` as WebP, about 960 px wide (and a 640 px copy), and copy the `<figure class="news-photo">` block from the SKERIC item. Describe the photo in `alt`.

After changing a page, update its `<lastmod>` date in `sitemap.xml`.

## Search engines

- Each page has its own title, description and canonical address, and structured data (JSON-LD) describing the organisation, the questions and the science article.
- Add the site to Google Search Console as a Domain property (verified with a TXT record at Namecheap) and submit `https://senvahealth.com/sitemap.xml`. Bing Webmaster Tools can import it from Search Console.
- Links from other sites help most: Umeå University, Umeå University Holding, KTH Innovation and the founders' LinkedIn profiles.

## Waiting list

The form posts to the existing Formspree form `xzdopbyo` (the same one the EpiVida site used). If that form is restricted to certain domains in Formspree, add `senvahealth.com`.

## Hosting

Hosted on statichost.eu, deployed from this repository. DNS at Namecheap:

| Type | Host | Value |
|---|---|---|
| A | `@` | `95.217.26.94` |
| AAAA | `@` | `2a01:4f9:c01f:8002::` |
| CNAME | `www` | `senvahealth.statichost.page` |

## Keep off this site

How the model is built, performance figures, and lab partner names that haven't been cleared for marketing.
