# Hector Travaillé — Portfolio

Static, single-page portfolio. Vanilla HTML / CSS / JS.

## Run locally

```
open index.html
```

Or serve over HTTP:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Add a project

In `index.html`, find a `<!-- PROJECT N -->` block and replace `href`, the title text, and the tag text:

```html
<a class="headline-link" href="https://your-case-study-url">
  <span class="headline-link__title">Your Project Name</span>
  <span class="headline-link__tag">Your tag</span>
</a>
<hr class="section-separator" />
```

To add a 4th, 5th, etc., duplicate one of the blocks above (and its trailing `<hr>`).

Drop project assets in `assets/`.

## Design system

Based on Anacuna (digital Brutalism). Tokens live in `styles.css` `:root`.
