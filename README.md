# senvahealth.com

The Senva website. Plain HTML and CSS with no build step: the files are published as they are.

| File | What it is |
|---|---|
| `index.html` | Home page, including the waiting-list form |
| `privacy.html` | Privacy notice for the waiting list |
| `styles.css` | All styling |
| `fonts/` | Self-hosted Cormorant Garamond and Outfit (SIL Open Font Licence, see `fonts/OFL.txt`), so no visitor data goes to Google Fonts |
| `favicon.svg`, `apple-touch-icon.png` | Browser and phone icons |
| `og.png` | Image shown when the link is shared, for example on LinkedIn |
| `statichost.yml` | Tells statichost.eu to publish the files without a build |

## Adding news

In `index.html`, find the News section, copy one `<article class="news-item">` block, paste it at the top of the list and edit the date, title and text. For a LinkedIn post, add `<p><a href="POST-URL">Read the post on LinkedIn</a></p>` inside the block. Links rather than embedded posts keep LinkedIn's tracking off the site.

## Waiting list

The form posts to the existing Formspree form `xzdopbyo` (the same one the EpiVida site used). If that form is restricted to certain domains in Formspree, add `senvahealth.com`.

## Hosting

Hosted on statichost.eu, deployed from this repository. DNS at Namecheap:

| Type | Host | Value |
|---|---|---|
| ALIAS | `@` | `SITENAME.statichost.page` |
| CNAME | `www` | `SITENAME.statichost.page` |

## Keep off this site

How the model is built, performance figures, and lab partner names that haven't been cleared for marketing.
