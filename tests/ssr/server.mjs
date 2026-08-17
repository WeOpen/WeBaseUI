import { readFile } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));
const templatePath = path.join(root, 'index.html');
const port = Number(process.env.WEBASE_SSR_PORT ?? 4177);
const host = '127.0.0.1';

const vite = await createViteServer({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom'
});

const server = createHttpServer((request, response) => {
  vite.middlewares(request, response, async () => {
    try {
      const url = request.url ?? '/';
      let template = await readFile(templatePath, 'utf8');
      template = await vite.transformIndexHtml(url, template);
      const { renderPage } = await vite.ssrLoadModule('/src/entry-server.ts');
      const rendered = renderPage();
      const html = template
        .replace('<!--ssr-head-->', rendered.head)
        .replace('<!--ssr-outlet-->', rendered.body);

      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error);
      response.statusCode = 500;
      response.end(error instanceof Error ? error.stack : String(error));
    }
  });
});

server.listen(port, host, () => {
  console.log(`WeBaseUI SSR fixture listening on http://${host}:${port}`);
});

async function close() {
  await vite.close();
  server.close();
}

process.once('SIGINT', close);
process.once('SIGTERM', close);
