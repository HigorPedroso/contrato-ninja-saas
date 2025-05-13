import { SitemapStream } from 'sitemap';
import { createWriteStream } from 'fs';
import { supabase } from '../src/integrations/supabase/client';

const generateSitemap = async () => {
  const hostname = 'https://contratoninja.com.br';
  const smStream = new SitemapStream({ hostname });
  const writeStream = createWriteStream('public/sitemap.xml');

  smStream.pipe(writeStream);

  // Add static routes
  const staticRoutes = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/blog', changefreq: 'daily', priority: 0.8 },
    // ... other static routes
  ];

  for (const route of staticRoutes) {
    smStream.write(route);
  }

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

  return new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
};

generateSitemap()
  .then(() => {
    console.log('Sitemap generated successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  });