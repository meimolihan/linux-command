import path from 'path';
import fs from 'fs-extra';
import SitemapGenerator from 'sitemap-generator';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const SITE_REPLACE = process.env.SITE_REPLACE || 'https://wangchujiang.com/linux-command';

const xmlFile = path.join(process.cwd(), '.deploy/sitemap.xml');
const generator = SitemapGenerator(SITE_URL, {
  maxDepth: 0,
  filepath: xmlFile,
  maxEntriesPerFile: 50000,
  stripQuerystring: true,
  decodeResponses: true,
});

generator.on('done', async () => {
  const str = await fs.readFileSync(xmlFile);
  const escapedUrl = SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const newStr = str.toString().replace(new RegExp(escapedUrl, 'g'), SITE_REPLACE);
  await fs.outputFile(xmlFile, newStr);
  console.log('sitemaps created!');
});

generator.start();
