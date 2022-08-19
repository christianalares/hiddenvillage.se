/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
}
