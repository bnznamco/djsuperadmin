import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'

// DjSuperAdmin documentation — VitePress.
// Published to GitHub Pages under /djsuperadmin/. The vitepress-plugin-llms
// build step emits llms.txt + llms-full.txt so AI agents / IDEs can ingest
// the docs.
export default defineConfig({
  lang: 'en-US',
  title: 'DjSuperAdmin',
  description: 'Edit contents directly on your page with Django.',
  base: '/djsuperadmin/',
  cleanUrls: false,
  ignoreDeadLinks: true,
  markdown: {
    // Django/Jinja template fences (```django) have no Shiki grammar — render
    // them as HTML so they still get sensible highlighting.
    languageAlias: { django: 'html' },
  },
  head: [
    ['link', { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✍️</text></svg>' }],
  ],
  vite: {
    plugins: [llmstxt()],
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'QuickStart', link: '/QuickStart/' },
      { text: 'How to', link: '/How to/' },
    ],
    sidebar: [
      { text: 'QuickStart', link: '/QuickStart/' },
      { text: 'How to', link: '/How to/' },
      { text: 'Contribute', link: '/Contribute/' },
      { text: 'Changelog', link: '/Changelog/' },
      { text: 'License', link: '/License/' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lotrekagency/djsuperadmin' },
    ],
    search: { provider: 'local' },
    editLink: {
      pattern: 'https://github.com/lotrekagency/djsuperadmin/edit/master/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
})
