
import FountainMap from "./features/map/FountainMap.svelte";
import About from "./features/about/About.svelte";
import Contact from "./features/contact/Contact.svelte";
import NotFound from "./shared/components/NotFound.svelte"

export default {
  '/': FountainMap,
  '/about': About,
  '/contact': Contact,
  '*': NotFound,       
}