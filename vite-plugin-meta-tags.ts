import type { Plugin } from 'vite';

export function metaTagsPlugin(): Plugin {
  return {
    name: 'dynamic-meta-tags',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Only handle card URLs
        if (req.url && req.url.startsWith('/card/')) {
          const html = `<!DOCTYPE html>
<html lang="th" class="font-playpen">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>เธอได้รับการ์ดวาเลนไทน์นะ 💖</title>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="เธอได้รับการ์ดวาเลนไทน์นะ 💖" />
  <meta property="og:description" content="มีคนส่งเซอร์ไพรส์มาให้เธอด้วยแหละ... ลองเปิดดูนะ" />
  <meta property="og:image" content="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&h=630&fit=crop" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="https://card.yourhome.co.th${req.url}" />
  <meta property="og:site_name" content="Valentine Card Maker" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="เธอได้รับการ์ดวาเลนไทน์นะ 💖" />
  <meta name="twitter:description" content="มีคนส่งเซอร์ไพรส์มาให้เธอด้วยแหละ... ลองเปิดดูนะ" />
  <meta name="twitter:image" content="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&h=630&fit=crop" />
  
  <!-- Additional Meta Tags -->
  <meta name="description" content="เธอได้รับการ์ดวาเลนไทน์นะ 💖" />
  <meta name="theme-color" content="#ff69b4" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
          
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
          return;
        }
        next();
      });
    },
  };
}
