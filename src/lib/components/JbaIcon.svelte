<script lang="ts">
  import {
    JBA_VIEWBOX_FULL,
    JBA_VIEWBOX_PILLAR,
    JBA_VIEWBOX_SWOOSH,
    JBA_NAVY_PATH,
    JBA_GOLD_PATH,
    JBA_PILLAR_PATH,
    JBA_SWOOSH_ONLY_PATH
  } from './jbaVectorData';

  export type JbaIconVariant =
    | 'monogram'
    | 'pillar'
    | 'swoosh'
    | 'seal'
    | 'scales'
    | 'ledger'
    | 'gavel'
    | 'shield'
    | 'diamond'
    | 'edital';

  interface Props {
    variant?: JbaIconVariant;
    size?: number;
    theme?: 'light' | 'dark' | 'gold';
    className?: string;
    ariaLabel?: string;
  }

  let {
    variant = 'pillar',
    size = 28,
    theme = 'gold',
    className = '',
    ariaLabel = ''
  }: Props = $props();

  const uid = `jba-ico-${Math.random().toString(36).slice(2, 9)}`;
</script>

{#if variant === 'monogram'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={JBA_VIEWBOX_FULL}
    width={Math.round(size * 2.24)}
    height={size}
    class="jba-icon jba-icon-monogram {className}"
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel || undefined}
    aria-hidden={!ariaLabel}
  >
    <defs>
      <linearGradient id="{uid}-navy" x1="0" y1="0" x2="1" y2="1">
        {#if theme === 'dark'}
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="0.55" stop-color="#f4f7fb" />
          <stop offset="1" stop-color="#dbe6f5" />
        {:else}
          <stop offset="0" stop-color="#081c4a" />
          <stop offset="0.45" stop-color="#16398a" />
          <stop offset="1" stop-color="#06143a" />
        {/if}
      </linearGradient>
      <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a2721a" />
        <stop offset="0.5" stop-color="#f9d567" />
        <stop offset="1" stop-color="#c49539" />
      </linearGradient>
    </defs>
    <path fill="url(#{uid}-navy)" fill-rule="evenodd" d={JBA_NAVY_PATH} />
    <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_GOLD_PATH} />
  </svg>
{:else if variant === 'pillar'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={JBA_VIEWBOX_PILLAR}
    width={size}
    height={size}
    class="jba-icon jba-icon-pillar {className}"
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel || undefined}
    aria-hidden={!ariaLabel}
  >
    <defs>
      <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a2721a" />
        <stop offset="0.5" stop-color="#f9d567" />
        <stop offset="1" stop-color="#c49539" />
      </linearGradient>
    </defs>
    <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_PILLAR_PATH} />
  </svg>
{:else if variant === 'swoosh'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={JBA_VIEWBOX_SWOOSH}
    width={Math.round(size * 2.4)}
    height={size}
    class="jba-icon jba-icon-swoosh {className}"
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel || undefined}
    aria-hidden={!ariaLabel}
  >
    <defs>
      <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a2721a" />
        <stop offset="0.5" stop-color="#f9d567" />
        <stop offset="1" stop-color="#c49539" />
      </linearGradient>
    </defs>
    <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_GOLD_PATH} />
  </svg>
{:else if variant === 'seal'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={size}
    height={size}
    class="jba-icon jba-icon-seal {className}"
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel || undefined}
    aria-hidden={!ariaLabel}
  >
    <defs>
      <linearGradient id="{uid}-navy" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#081c4a" />
        <stop offset="0.45" stop-color="#16398a" />
        <stop offset="1" stop-color="#06143a" />
      </linearGradient>
      <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a2721a" />
        <stop offset="0.5" stop-color="#f9d567" />
        <stop offset="1" stop-color="#c49539" />
      </linearGradient>
    </defs>
    <!-- Octagonal Sovereign Seal Outer Ring -->
    <polygon
      points="20,3 44,3 61,20 61,44 44,61 20,61 3,44 3,20"
      fill="url(#{uid}-navy)"
      stroke="url(#{uid}-gold)"
      stroke-width="1.5"
    />
    <circle
      cx="32"
      cy="32"
      r="24.5"
      fill="none"
      stroke="url(#{uid}-gold)"
      stroke-width="0.9"
      stroke-dasharray="2 2"
      opacity="0.75"
    />
    <!-- Exact Vectorized JBA Monogram Embedded Inside Seal -->
    <g transform="translate(8.5, 20.5) scale(0.0445)">
      <path fill="#FAF7F0" fill-rule="evenodd" d={JBA_NAVY_PATH} />
      <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_GOLD_PATH} />
    </g>
    <!-- Top & Bottom Diamond Stars -->
    <polygon points="32,9.5 34,11.5 32,13.5 30,11.5" fill="url(#{uid}-gold)" />
    <polygon points="32,50.5 34,52.5 32,54.5 30,52.5" fill="url(#{uid}-gold)" />
  </svg>
{:else}
  <!-- Architectural 32x32 Icon Integrating Exact Vectorized JBA Pillar / Swoosh Motifs -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    class="jba-icon jba-icon-{variant} {className}"
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel || undefined}
    aria-hidden={!ariaLabel}
  >
    <defs>
      <linearGradient id="{uid}-navy" x1="0" y1="0" x2="1" y2="1">
        {#if theme === 'dark'}
          <stop offset="0" stop-color="#FAF7F0" />
          <stop offset="1" stop-color="#CBD5E1" />
        {:else}
          <stop offset="0" stop-color="#081c4a" />
          <stop offset="0.45" stop-color="#16398a" />
          <stop offset="1" stop-color="#06143a" />
        {/if}
      </linearGradient>
      <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a2721a" />
        <stop offset="0.5" stop-color="#f9d567" />
        <stop offset="1" stop-color="#c49539" />
      </linearGradient>
    </defs>

    {#if variant === 'scales'}
      <!-- Scales of Public Law with Exact Vectorized JBA Fluted Golden Pillar as Central Fulcrum -->
      <g transform="translate(-57.6, -15.5) scale(0.0955)">
        <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_PILLAR_PATH} />
      </g>
      <!-- Ultra-Fine Architectural Balance Beam & Pans -->
      <path
        d="M5 11.5L16 9L27 11.5"
        stroke="url(#{uid}-navy)"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <circle cx="16" cy="9" r="1.75" fill="url(#{uid}-gold)" />
      <!-- Left Pan -->
      <path
        d="M5.5 11.5L3 19.5H8.5L5.5 11.5Z"
        stroke="url(#{uid}-navy)"
        stroke-width="1.25"
        stroke-linejoin="round"
      />
      <path
        d="M2.2 19.5C2.2 21.3 3.8 22.5 5.75 22.5C7.7 22.5 9.3 21.3 9.3 19.5H2.2Z"
        fill="url(#{uid}-gold)"
        opacity="0.88"
      />
      <!-- Right Pan -->
      <path
        d="M26.5 11.5L23.5 19.5H29L26.5 11.5Z"
        stroke="url(#{uid}-navy)"
        stroke-width="1.25"
        stroke-linejoin="round"
      />
      <path
        d="M22.7 19.5C22.7 21.3 24.3 22.5 26.25 22.5C28.2 22.5 29.8 21.3 29.8 19.5H22.7Z"
        fill="url(#{uid}-gold)"
        opacity="0.88"
      />
      <!-- Classical Plinth Base -->
      <line x1="8" y1="29" x2="24" y2="29" stroke="url(#{uid}-gold)" stroke-width="1.5" stroke-linecap="round" />
    {:else if variant === 'ledger'}
      <!-- Public Accounting & LRF Ledger with Exact Vectorized JBA Golden Column & Swoosh Crest -->
      <rect
        x="5"
        y="3.5"
        width="22"
        height="25"
        rx="3"
        stroke="url(#{uid}-navy)"
        stroke-width="1.25"
      />
      <line x1="9.5" y1="3.5" x2="9.5" y2="28.5" stroke="url(#{uid}-gold)" stroke-width="1.25" />
      <!-- Exact JBA Golden Column & Swoosh Embossed Inside Ledger -->
      <g transform="translate(-31.8, -11) scale(0.064)">
        <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_PILLAR_PATH} />
      </g>
      <g transform="translate(8.5, 11) scale(0.02)">
        <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_SWOOSH_ONLY_PATH} />
      </g>
      <!-- Precision Accounting Rules -->
      <line x1="12.5" y1="21.5" x2="23.5" y2="21.5" stroke="url(#{uid}-navy)" stroke-width="1.25" stroke-linecap="round" />
      <line x1="12.5" y1="24.5" x2="20.5" y2="24.5" stroke="url(#{uid}-gold)" stroke-width="1.25" stroke-linecap="round" />
    {:else if variant === 'gavel'}
      <!-- Administrative Governance & Lei 14.133/21 with Exact JBA Golden Swoosh Arc -->
      <path
        d="M13.5 6.5L19.5 12.5M10.5 9.5L16.5 15.5M12 8L18 14"
        stroke="url(#{uid}-gold)"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <rect
        x="11.2"
        y="5.2"
        width="9.5"
        height="5.2"
        rx="1.5"
        transform="rotate(45 11.2 5.2)"
        stroke="url(#{uid}-navy)"
        stroke-width="1.25"
      />
      <line
        x1="13.5"
        y1="12.5"
        x2="5.5"
        y2="20.5"
        stroke="url(#{uid}-navy)"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <!-- Exact JBA Golden Swoosh Arc Underlining the Sounding Block -->
      <g transform="translate(1.5, 17.5) scale(0.0285)">
        <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_SWOOSH_ONLY_PATH} />
      </g>
      <path
        d="M17 24.5H27.5"
        stroke="url(#{uid}-gold)"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    {:else if variant === 'shield'}
      <!-- Sovereign Cryptographic Shield with Exact Vectorized JBA Golden Pillar Inside -->
      <path
        d="M16 3.2L5.5 7.4V15.4C5.5 22.3 10.1 27.6 16 29.3C21.9 27.6 26.5 22.3 26.5 15.4V7.4L16 3.2Z"
        stroke="url(#{uid}-navy)"
        stroke-width="1.25"
        stroke-linejoin="round"
      />
      <path
        d="M16 5.6L8 8.9V15.2C8 20.6 11.5 24.9 16 26.5C20.5 24.9 24 20.6 24 15.2V8.9L16 5.6Z"
        stroke="url(#{uid}-gold)"
        stroke-width="0.9"
        stroke-opacity="0.75"
      />
      <!-- Exact Vectorized JBA Golden Fluted Pillar at Center of Shield -->
      <g transform="translate(-45.5, -13.5) scale(0.08)">
        <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_PILLAR_PATH} />
      </g>
    {:else if variant === 'edital'}
      <!-- Official Concurso Edital Document with Exact Vectorized JBA Monogram Stamp -->
      <path
        d="M7 4H20.5L25.5 9V27C25.5 27.8 24.8 28.5 24 28.5H7C6.2 28.5 5.5 27.8 5.5 27V5.5C5.5 4.7 6.2 4 7 4Z"
        stroke="url(#{uid}-navy)"
        stroke-width="1.25"
        stroke-linejoin="round"
      />
      <path d="M20 4V9.5H25.5" stroke="url(#{uid}-gold)" stroke-width="1.25" stroke-linejoin="round" />
      <line x1="9.5" y1="12.5" x2="18.5" y2="12.5" stroke="url(#{uid}-navy)" stroke-width="1.25" stroke-linecap="round" />
      <line x1="9.5" y1="16" x2="21.5" y2="16" stroke="url(#{uid}-navy)" stroke-width="1.25" stroke-linecap="round" />
      <!-- Exact JBA Vector Monogram Stamp on Edital -->
      <g transform="translate(8.5, 19) scale(0.0145)">
        <path fill="url(#{uid}-navy)" fill-rule="evenodd" d={JBA_NAVY_PATH} />
        <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_GOLD_PATH} />
      </g>
    {:else}
      <!-- 'diamond': Classical JBA Diamond & Golden Swoosh Ornament -->
      <polygon
        points="16,4 27,16 16,28 5,16"
        stroke="url(#{uid}-gold)"
        stroke-width="1.25"
      />
      <polygon
        points="16,9.5 22,16 16,22.5 10,16"
        fill="url(#{uid}-gold)"
        opacity="0.25"
      />
      <g transform="translate(-41.8, -11.2) scale(0.075)">
        <path fill="url(#{uid}-gold)" fill-rule="evenodd" d={JBA_PILLAR_PATH} />
      </g>
    {/if}
  </svg>
{/if}

<style>
  .jba-icon {
    display: inline-block;
    vertical-align: middle;
    flex-shrink: 0;
    overflow: visible;
  }
</style>
