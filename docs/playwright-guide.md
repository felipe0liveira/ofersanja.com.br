# Playwright Scraping Guidelines — Mercado Livre

## Anti-Detection Strategy

### Browser Launch Args
| Argument | Purpose |
|---|---|
| `--disable-blink-features=AutomationControlled` | Removes the Chrome automation flag that sites use to detect bots |
| `--disable-dev-shm-usage` | Prevents crashes in low-memory environments |
| `--no-sandbox` / `--disable-setuid-sandbox` | Required for containerized/CI environments |

---

### Browser Context
| Setting | Value | Purpose |
|---|---|---|
| `user_agent` | Chrome 120 / Windows 10 | Mimics a real desktop browser |
| `viewport` | 1920x1080 | Common desktop resolution; headless defaults look suspicious |
| `locale` | `pt-BR` | Prevents country redirects |
| `timezone_id` | `America/Sao_Paulo` | Reinforces Brazilian origin |

---

### HTTP Headers
| Header | Value | Purpose |
|---|---|---|
| `Accept` | `text/html,application/xhtml+xml,...` | Matches what a real browser sends |
| `Accept-Language` | `pt-BR,pt;q=0.9,en-US;q=0.8` | Preferred language negotiation |
| `Accept-Encoding` | `gzip, deflate, br` | Accepts compressed responses like a real browser |

---

### JavaScript Init Script (runs before page scripts)
```js
// Hides the WebDriver flag exposed by automated browsers
navigator.webdriver = undefined

// Adds the chrome runtime object (absent in headless by default)
window.chrome = { runtime: {} }

// Patches the Permissions API used as a browser fingerprint
navigator.permissions.query = (params) => { ... }
```

---

## Page Load Strategy

- **Wait event:** `domcontentloaded` — faster than `load`, avoids hanging on heavy assets
- **Retry logic:** up to 3 attempts on navigation failure
- **Post-load wait:** explicit timeout after DOM ready to allow JS rendering
- **Gradual scroll:** scrolls viewport-by-viewport to trigger lazy-loaded images and content
