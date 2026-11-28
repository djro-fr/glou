<script lang="ts">  
  import Nav from "./Nav.svelte"  
  import {Router} from '@keenmate/svelte-spa-router';    
  import routes from "../../routes"  
  import './Layout.scss'
  
  import { location } from '@keenmate/svelte-spa-router';
  import ToastContainer from "../components/ToastContainer.svelte";
  import Splash from "../components/Splash.svelte";
  import { markAppReady } from "../components/splashState.svelte.js";

  let isMapPage = $derived(location() === '/');

  // Only the map page has data to wait for; other first pages just get the minimum splash time
  if (location() !== '/') markAppReady();

</script>


<Nav />
<main class={isMapPage ? 'map-page' : ''}>
  <Router {routes} />
</main>
<ToastContainer />
<Splash />