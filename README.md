# senvahealth.com

The Senva website. Plain HTML and CSS with no build step: the files are published as they are.

| File | What it is |
|---|---|
| `index.html` | Home page: how it works, the science in brief, our model, our journey (with LinkedIn), team, questions, waiting-list form |
| `science.html` | Longer page on epigenetic clocks and biological age, with links to the research |
| `privacy.html` | Privacy notice for the waiting list |
| `404.html` | Shown for addresses that don't exist |
| `styles.css` | All styling |
| `site.js` | Phone menu, highlighting the menu item for the section in view, LinkedIn posts that load on request, and the waiting-list form |
| `img/` | Photos, as WebP in two sizes each |
| `fonts/` | Self-hosted Cormorant Garamond and Outfit (SIL Open Font Licence, see `fonts/OFL.txt`), so no visitor data goes to Google Fonts |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Browser and phone icons |
| `logo.png` | Logo that search engines can show next to the site |
| `og.png` | Image shown when the link is shared, for example on LinkedIn |
| `robots.txt`, `sitemap.xml` | Tell search engines what to index |
| `statichost.yml` | Tells statichost.eu to publish the files without a build |

## Adding a milestone to Our journey

In `index.html`, find the Our journey section, copy one `<li class="milestone">` block, paste it in date order (above the `next` item, which is the launch) and edit the date, title and text.

- **Photo:** save it in `img/` as WebP in two or three widths (640, 960 and 1280 px), copy the `<figure class="milestone-photo">` block from the SKERIC milestone and describe the photo in `alt`.
- **LinkedIn post:** on LinkedIn, click the three dots on the post, choose "Embed this post" and copy the code. Add this inside the milestone, using the `src` and `height` values from that code:

```html
<div class="li-post" data-embed="SRC-FROM-THE-EMBED-CODE" data-height="HEIGHT-FROM-THE-EMBED-CODE">
  <div class="li-post-gate">
    <p><strong>The post on LinkedIn.</strong> It’s loaded from LinkedIn, which can set cookies, so it only appears if you ask for it.</p>
    <div class="li-post-actions">
      <button class="button button-quiet" type="button">Show the post</button>
      <a href="LINK-TO-THE-POST">Open it on LinkedIn</a>
    </div>
  </div>
</div>
```

The post only loads when a visitor clicks "Show the post", so the site stays free of cookies and tracking until then, and no cookie banner is needed.

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
