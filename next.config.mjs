/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Every page of the old static site keeps working: the .html URLs that are
  // already indexed and shared redirect permanently to their new clean route.
  // Query strings (e.g. /youloop_blog.html?post=slug) are carried over.
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/youloop_about.html', destination: '/about', permanent: true },
      { source: '/youloop_blog.html', destination: '/journal', permanent: true },
      // /bulk-inquiry is retired: YOU LOOP Creation's page at /b2b now carries
      // the single project-inquiry form, so both the old static URL and the
      // route that replaced it point there. Kept as redirects rather than
      // deleted because the .html URL is indexed and /bulk-inquiry was linked
      // from the home page until recently.
      { source: '/youloop_bulk_inquiry.html', destination: '/b2b', permanent: true },
      { source: '/bulk-inquiry', destination: '/b2b', permanent: true },
      { source: '/b2b.html', destination: '/b2b', permanent: true },
      { source: '/zucity_preorder.html', destination: '/zucity', permanent: true },
      { source: '/SR01_Colour_Configurator.html', destination: '/collection/sr01', permanent: true },
      { source: '/SR02_Colour_Configurator.html', destination: '/collection/sr02', permanent: true },
      { source: '/SRAC01_Hood_Configurator.html', destination: '/collection/srac01', permanent: true },
    ];
  },
};

export default nextConfig;
