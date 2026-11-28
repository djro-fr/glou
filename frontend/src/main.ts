import { mount } from 'svelte'
import { setHashRoutingEnabled } from '@keenmate/svelte-spa-router'
import './shared/styles/reset.scss'
import './shared/styles/tokens.css'
import './shared/styles/global.scss'
import App from './App.svelte'
import { z } from 'zod';

z.config(z.locales.fr());
// The CSP forbids eval: skip Zod's new Function() probe (JIT parsers), which logs a CSP violation
z.config({ jitless: true });

setHashRoutingEnabled(false);

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
