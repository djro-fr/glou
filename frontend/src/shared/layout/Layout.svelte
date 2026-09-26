<script lang="ts">  
  import Nav from "./Nav.svelte"  
  import {Router} from '@keenmate/svelte-spa-router';    
  import routes from "../../routes"  
  import './Layout.scss'
  
  import { location } from '@keenmate/svelte-spa-router';

  let isMapPage = $derived(location() === '/');

</script>


<Nav />
<main class={isMapPage ? 'map-page' : ''}>
  <Router {routes} />
</main>