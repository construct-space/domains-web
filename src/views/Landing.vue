<script setup>
import { ref, computed } from 'vue'

// Public marketing page. Search + pricing hit domains-api.lisaos.dev directly
// via nginx proxy (/api/* in both dev + prod). No auth, no cart — clicking
// "Get" on an available result deep-links into my.lisaos.dev/domains
// where the user signs in and completes purchase. Anonymous search is
// intentionally cheap: it's the funnel.

const query = ref('')
const results = ref([])
const searching = ref(false)
const searched = ref(false)

const popularTLDs = [
  { ext: '.com', price: '$9.73' },
  { ext: '.io', price: '$33.38' },
  { ext: '.dev', price: '$12.98' },
  { ext: '.app', price: '$14.18' },
  { ext: '.domains', price: '$2.78' },
  { ext: '.space', price: '$1.88' },
  { ext: '.sh', price: '$5.00' },
]

const sortedResults = computed(() =>
  [...results.value].sort((a, b) => {
    if (a.available && !b.available) return -1
    if (!a.available && b.available) return 1
    return 0
  }),
)

function domainBase(domain) {
  const parts = domain.split('.')
  return parts.slice(0, -1).join('.')
}

function domainTLD(domain) {
  const parts = domain.split('.')
  return parts[parts.length - 1]
}

async function search() {
  const q = query.value.trim()
  if (!q) return

  searching.value = true
  searched.value = true
  results.value = []

  try {
    // Direct call to domains-api.lisaos.dev — not through this site's nginx.
    // Keeps the landing a pure static asset and means a 404 on /api/search
    // in devtools points at the actual API host, not this proxy.
    const res = await fetch('https://domains-api.lisaos.dev/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q }),
    })
    const data = await res.json()
    results.value = data.results || []
  } catch {
    results.value = []
  } finally {
    searching.value = false
  }
}

function searchTLD(tld) {
  const base = query.value.trim().replace(/\.[a-z]+$/i, '')
  query.value = (base || 'construct') + tld
  search()
}

// Hand-off to my.c.s where the logged-in purchase flow lives. Include the
// searched domain as a query param so the tenant UI can pre-populate and
// jump straight to checkout once the user signs in.
function getDomainURL(domain) {
  const u = new URL('https://my.lisaos.dev/domains')
  u.searchParams.set('register', domain)
  return u.toString()
}
</script>

<template>
  <div class="page">
    <section class="hero">
      <div class="hero-tag">CONSTRUCT<span class="accent">:DOMAINS</span></div>
      <h1>Find your perfect<br><span class="accent">domain name.</span></h1>
      <p class="hero-sub">
        Search, register, and manage domains for your next project. Instant DNS, free SSL, WHOIS privacy — part of the Construct ecosystem.
      </p>

      <div class="search-box">
        <input
          v-model="query"
          type="text"
          placeholder="Search for a domain name..."
          autofocus
          @keydown.enter="search"
        />
        <button class="search-btn" :disabled="searching" @click="search">
          {{ searching ? 'Searching…' : 'Search' }}
        </button>
      </div>

      <div class="tld-pills">
        <button
          v-for="tld in popularTLDs"
          :key="tld.ext"
          class="tld-pill"
          @click="searchTLD(tld.ext)"
        >
          {{ tld.ext }} <span class="price">{{ tld.price }}</span>
        </button>
      </div>
    </section>

    <section v-if="sortedResults.length" class="results">
      <div
        v-for="r in sortedResults"
        :key="r.domain"
        :class="['result', r.available ? 'avail' : 'taken']"
      >
        <span class="result-domain">
          {{ domainBase(r.domain) }}<span class="result-tld">.{{ domainTLD(r.domain) }}</span>
        </span>
        <div class="result-right">
          <span v-if="r.available && r.price" class="result-price">
            ${{ r.price }}<span class="yr">/yr</span>
          </span>
          <span :class="['result-tag', r.available ? 'tag-avail' : 'tag-taken']">
            {{ r.available ? 'Available' : 'Taken' }}
          </span>
          <a v-if="r.available" class="btn btn-primary btn-sm" :href="getDomainURL(r.domain)">
            Get
          </a>
        </div>
      </div>
    </section>

    <section v-if="searched && !sortedResults.length && !searching" class="empty">
      No results. Try a different name.
    </section>

    <section class="features">
      <p class="section-label">WHY CONSTRUCT DOMAINS</p>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Instant DNS</h3>
          <p>Records propagate in seconds, not hours. Full API + UI for every TLD we support.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>WHOIS privacy</h3>
          <p>Free and on by default. Your personal info stays out of public WHOIS databases.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔐</div>
          <h3>Free SSL</h3>
          <p>Let's Encrypt-issued certs provisioned automatically when you point a record.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>API access</h3>
          <p>Same REST API we use internally. Automate renewal, DNS, redirects from your CI.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔁</div>
          <h3>URL forwarding</h3>
          <p>One-click redirect an entire domain to another — 301 or 302, with path preservation.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🛠</div>
          <h3>Unified dashboard</h3>
          <p>Manage domains alongside your spaces + email delivery in my.lisaos.dev.</p>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
      <span class="muted">Part of the</span>
      <a href="https://lisaos.dev">Construct</a>
      <span class="muted">ecosystem</span>
    </footer>
  </div>
</template>

<style scoped>
.page { max-width: 820px; margin: 0 auto; padding: 80px 24px 60px; }

/* Hero */
.hero { margin-bottom: 60px; }
.hero-tag { font-size: 11px; letter-spacing: 0.15em; font-weight: 600; color: var(--app-muted); margin-bottom: 20px; }
.accent { color: var(--app-accent); }
.hero h1 { font-size: 3.25rem; font-weight: 700; line-height: 1.1; margin-bottom: 18px; }
.hero-sub { font-size: 1.0625rem; color: var(--app-muted); line-height: 1.6; max-width: 560px; margin-bottom: 28px; }

/* Search */
.search-box { display: flex; gap: 8px; margin-bottom: 18px; }
.search-box input {
  flex: 1;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-foreground);
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s;
}
.search-box input:focus { border-color: var(--app-accent); }
.search-btn {
  padding: 0 24px;
  border-radius: 10px;
  border: none;
  background: var(--app-accent);
  color: var(--app-accent-fg);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.search-btn:hover:not(:disabled) { opacity: 0.9; }
.search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* TLD pills */
.tld-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.tld-pill {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid var(--app-border);
  background: transparent;
  color: var(--app-muted);
  cursor: pointer;
  font-family: monospace;
  transition: all 0.15s;
}
.tld-pill:hover { color: var(--app-foreground); border-color: var(--app-foreground); }
.tld-pill .price { color: var(--app-foreground); margin-left: 4px; }

/* Results */
.results { display: flex; flex-direction: column; gap: 8px; margin-bottom: 60px; }
.result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 10px;
  border: 1px solid var(--app-border);
  background: var(--app-card-bg);
}
.result.avail { border-color: color-mix(in srgb, var(--app-success) 40%, transparent); }
.result-domain { font-family: monospace; font-size: 15px; }
.result-tld { color: var(--app-accent); }
.result-right { display: flex; align-items: center; gap: 12px; }
.result-price { font-weight: 600; font-size: 15px; }
.result-price .yr { color: var(--app-muted); font-weight: 400; font-size: 12px; margin-left: 2px; }
.result-tag { font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; }
.tag-avail { background: color-mix(in srgb, var(--app-success) 15%, transparent); color: var(--app-success); }
.tag-taken { background: var(--app-surface); color: var(--app-muted); }

/* Buttons */
.btn { display: inline-flex; align-items: center; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.15s; }
.btn-primary { background: var(--app-accent); color: var(--app-accent-fg); }
.btn-primary:hover { opacity: 0.9; }
.btn-sm { padding: 6px 14px; font-size: 12px; }

/* Empty */
.empty { padding: 24px; text-align: center; color: var(--app-muted); font-size: 14px; margin-bottom: 60px; }

/* Features */
.features { margin-bottom: 60px; }
.section-label { font-size: 10px; letter-spacing: 0.15em; font-weight: 600; color: var(--app-muted); margin-bottom: 16px; }
.feature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.feature-card { padding: 22px; border: 1px solid var(--app-border); border-radius: 10px; transition: border-color 0.15s; }
.feature-card:hover { border-color: var(--app-accent); }
.feature-icon { font-size: 22px; margin-bottom: 12px; }
.feature-card h3 { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
.feature-card p { font-size: 13px; color: var(--app-muted); line-height: 1.5; }

/* Footer */
.landing-footer { text-align: center; font-size: 13px; color: var(--app-muted); padding-top: 24px; border-top: 1px solid var(--app-border); }
.muted { margin: 0 4px; }

@media (max-width: 640px) {
  .page { padding: 40px 20px; }
  .hero h1 { font-size: 2.25rem; }
  .feature-grid { grid-template-columns: 1fr; }
  .search-box { flex-direction: column; }
  .search-btn { padding: 12px; }
}
</style>
