/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: { images: { layoutRaw: true } },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
}
