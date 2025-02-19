import { GetServerSideProps, GetServerSidePropsContext } from "next";

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tatugaschool.com</loc>
    <lastmod>2025-02-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
   <url>
    <loc>https:/tatugaschool.com</loc>
    <lastmod>2025-02-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://app.tatugaschool.com/auth/sign-in</loc>
    <lastmod>2025-02-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://student.tatugaschool.com/welcome</loc>
    <lastmod>2025-02-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  context.res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  const sitemap = generateSiteMap();
  context.res.write(sitemap);
  context.res.end();
  return {
    props: {},
  };
};

export default SiteMap;
