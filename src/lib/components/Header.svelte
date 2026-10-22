<script lang="ts">
  import { page } from '$app/state';
  import { base } from '$app/paths';
  import LogoJBA from './LogoJBA.svelte';

  let mobileMenuOpen = $state(false);

  const navLinks = [
    { href: `${base}/`, path: '/', label: 'Início' },
    { href: `${base}/atuacao`, path: '/atuacao', label: 'Consultoria Pública' },
    { href: `${base}/concursos`, path: '/concursos', label: 'Concursos Públicos' },
    { href: `${base}/transparencia`, path: '/transparencia', label: 'Transparência & Contato' }
  ];

  function isActive(targetPath: string, currentPath: string): boolean {
    const cleanCurrent = currentPath.replace(base, '') || '/';
    if (targetPath === '/') return cleanCurrent === '/';
    return cleanCurrent.startsWith(targetPath);
  }

  function closeMenu() {
    mobileMenuOpen = false;
  }
</script>

<header class="jba-header no-print">
  <div class="container header-inner">
    <a
      href="{base}/"
      class="brand-link"
      onclick={closeMenu}
      aria-label="Página Inicial JBA Consultorias e Soluções Públicas"
    >
      <LogoJBA variant="compact" theme="dark" />
    </a>

    <nav class="desktop-nav" aria-label="Navegação Principal">
      {#each navLinks as link}
        {@const active = isActive(link.path, page.url.pathname)}
        <a
          href={link.href}
          class="nav-item"
          class:active
          aria-current={active ? 'page' : undefined}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <div class="header-actions">
      <a href="{base}/concursos" class="btn-header-cta">
        Concursos Abertos
      </a>

      <button
        type="button"
        class="mobile-toggle"
        class:open={mobileMenuOpen}
        aria-expanded={mobileMenuOpen}
        aria-label="Abrir ou fechar menu de navegação"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
      >
        <span class="burger-line line-top"></span>
        <span class="burger-line line-bottom"></span>
      </button>
    </div>
  </div>

  {#if mobileMenuOpen}
    <nav class="mobile-nav" aria-label="Menu Mobile">
      <div class="container mobile-nav-inner">
        {#each navLinks as link}
          {@const active = isActive(link.path, page.url.pathname)}
          <a
            href={link.href}
            class="mobile-nav-item"
            class:active
            onclick={closeMenu}
          >
            <span>{link.label}</span>
          </a>
        {/each}
        <a href="{base}/concursos" class="btn-header-cta mobile-cta" onclick={closeMenu}>
          Acessar Portal de Concursos
        </a>
      </div>
    </nav>
  {/if}
</header>

<style>
  .jba-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #06143a;
    border-bottom: 1px solid rgba(196, 149, 57, 0.3);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
    gap: 1.5rem;
  }

  .brand-link {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .nav-item {
    padding: 0.5rem 0.9rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(250, 247, 240, 0.82);
    border-radius: 6px;
    transition: color 0.2s ease, background-color 0.2s ease;
    white-space: nowrap;
  }

  .nav-item:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.06);
  }

  .nav-item.active {
    color: #f9d567;
    font-weight: 600;
    background-color: rgba(249, 213, 103, 0.1);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .btn-header-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.55rem 1.1rem;
    border-radius: 6px;
    background: #c49539;
    color: #06143a;
    font-size: 0.84rem;
    font-weight: 700;
    transition: background-color 0.2s ease;
    white-space: nowrap;
  }

  .btn-header-cta:hover {
    background: #e0b84f;
  }

  .mobile-toggle {
    display: none;
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(249, 213, 103, 0.3);
    color: #FAF7F0;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  .burger-line {
    position: absolute;
    width: 18px;
    height: 1.75px;
    background-color: #FAF7F0;
    border-radius: 2px;
    transition: transform 0.25s ease;
  }

  .line-top {
    transform: translateY(-4px);
  }

  .line-bottom {
    transform: translateY(4px);
  }

  .mobile-toggle.open .line-top {
    transform: translateY(0) rotate(45deg);
    background-color: #f9d567;
  }

  .mobile-toggle.open .line-bottom {
    transform: translateY(0) rotate(-45deg);
    background-color: #f9d567;
  }

  .mobile-nav {
    background: #040b1a;
    border-top: 1px solid rgba(249, 213, 103, 0.2);
    padding: 1rem 0;
  }

  .mobile-nav-inner {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .mobile-nav-item {
    padding: 0.75rem 0.9rem;
    color: #FAF7F0;
    font-weight: 500;
    border-radius: 6px;
  }

  .mobile-nav-item.active {
    color: #f9d567;
    background: rgba(249, 213, 103, 0.1);
    font-weight: 600;
  }

  .mobile-cta {
    margin-top: 0.5rem;
    width: 100%;
    padding: 0.75rem;
  }

  @media (max-width: 960px) {
    .desktop-nav {
      display: none;
    }
    .mobile-toggle {
      display: inline-flex;
    }
  }

  @media (max-width: 640px) {
    .header-actions .btn-header-cta {
      display: none;
    }
    .header-inner {
      min-height: 64px;
    }
  }
</style>
