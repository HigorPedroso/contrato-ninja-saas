import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { supabase } from '@/integrations/supabase/client';

async function generateSitemap() {
  const hostname = 'https://contratoninja.com.br';

  const smStream = new SitemapStream({ hostname });

  // Add static routes
  const staticRoutes = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/blog', changefreq: 'daily', priority: 0.8 },
    { url: '/modelos', changefreq: 'weekly', priority: 0.8 },
    { url: '/sobre', changefreq: 'monthly', priority: 0.5 },
    { url: '/contato', changefreq: 'monthly', priority: 0.5 },
    { url: '/faq', changefreq: 'monthly', priority: 0.7 },
    { url: '/termos', changefreq: 'monthly', priority: 0.3 },
    { url: '/privacidade', changefreq: 'monthly', priority: 0.3 },
    { url: '/lgpd', changefreq: 'monthly', priority: 0.3 },
  ];

  staticRoutes.forEach(route => {
    smStream.write(route);
  });

  // Add dynamic blog posts
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);

    if (error) throw error;

    posts?.forEach(post => {
      smStream.write({
        url: `/blog/${post.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: post.updated_at
      });
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }

  smStream.end();

  // Generate sitemap XML
  const sitemap = await streamToPromise(smStream);
  createWriteStream('public/sitemap.xml').write(sitemap.toString());
}

export default generateSitemap;