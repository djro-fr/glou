<script lang="ts">  
  import IconSprite from "../components/IconSprite.svelte"
  import './Nav.scss'  
  import { link } from '@keenmate/svelte-spa-router';
</script>

<IconSprite />
<nav id='main-nav'>
  <ul>
    <li>
      <a use:link href="/">
        <svg><use href="#MapSVG" /></svg>
        <p>Accueil</p>
      </a>
    </li>
    <li>
      <a use:link href="/contact">
        <svg><use href="#ContactSVG" /></svg>
        <p>Contact</p>
      </a>
    </li>
    <li>
      <a use:link href="/about">
        <svg><use href="#AboutSVG" /></svg>
        <p>À Propos</p>
      </a>
    </li>
  </ul>
</nav>