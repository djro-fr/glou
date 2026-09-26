import { mount } from 'svelte';
import { setHashRoutingEnabled } from '@keenmate/svelte-spa-router';
import './shared/styles/reset.scss';
import './shared/styles/tokens.css';
import App from './App.svelte';
setHashRoutingEnabled(false);
const app = mount(App, {
    target: document.getElementById('app'),
});
export default app;
//# sourceMappingURL=main.js.map