<template>
  <router-view />
</template>

<script setup>
</script>

<style>
/* Marketing-only landing. No sidebar, no auth, no toasts, no cart —
   those concerns moved to my.lisaos.dev/domains when the tenant UI
   split out. This shell just sets the dark theme and lets Landing.vue
   own the page. */
:root {
  --app-background: #0f0f10;
  --app-foreground: #e6e6e8;
  --app-muted: #8a8a93;
  --app-accent: #FF2D55;
  --app-accent-fg: #ffffff;
  --app-border: #2a2a2e;
  --app-surface: #1a1a1d;
  --app-card-bg: #18181b;
  --app-success: #34C759;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: var(--app-background);
  color: var(--app-foreground);
  font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a { color: var(--app-accent); text-decoration: none; }
input, button { font-family: inherit; }
</style>
