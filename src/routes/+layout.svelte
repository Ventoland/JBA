<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <link rel="icon" href="{base}/favicon.svg" type="image/svg+xml" />
  <meta name="theme-color" content="#0B1B3D" />
</svelte:head>

<div class="jba-app-shell">
  <Header />
  <main class="jba-main-content">
    {@render children()}
  </main>
  <Footer />
</div>

<style>
  .jba-app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .jba-main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
