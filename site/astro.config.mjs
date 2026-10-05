// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://pharaohalone.com',
  trailingSlash: 'always',
  integrations: [mdx()],
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
