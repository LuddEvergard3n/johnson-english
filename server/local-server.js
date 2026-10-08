/**
 * Servidor HTTP local do Johnson English.
 *
 * Expõe somente os arquivos deste repositório em 127.0.0.1. Isso permite
 * usar módulos ES e fetch(), que os navegadores bloqueiam em URLs file://.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');

const HOST = '127.0.0.1';
const PORT = 4175;
const ROOT = path.resolve(__dirname, '..');
const SITE_URL = `http://${HOST}:${PORT}/`;
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function openBrowser() {
  if (!process.argv.includes('--open')) return;
  const commands = {
    win32: ['cmd.exe', ['/d', '/s', '/c', `start "" "${SITE_URL}"`]],
    darwin: ['open', [SITE_URL]],
    linux: ['xdg-open', [SITE_URL]]
  };
  const command = commands[process.platform];
  if (command) execFile(command[0], command[1], () => {});
}

const server = http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, SITE_URL).pathname);
  } catch {
    response.writeHead(400).end('Requisicao invalida');
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = path.resolve(ROOT, relativePath);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
    response.writeHead(403).end('Acesso negado');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Arquivo nao encontrado');
      return;
    }
    response.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
    response.end(data);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`O Johnson English ja esta disponivel em ${SITE_URL}`);
    openBrowser();
    return;
  }
  console.error(`Nao foi possivel iniciar o Johnson English: ${error.message}`);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`Johnson English disponivel em ${SITE_URL}`);
  console.log('Mantenha esta janela aberta enquanto estiver estudando.');
  openBrowser();
});
