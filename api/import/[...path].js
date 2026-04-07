const { createParecer, parseRawText } = require('../../lib/services/indexService');
const { extractTextFromBuffer } = require('../../lib/services/pdfExtractor');
const { requireAuth } = require('../../lib/auth');

module.exports.config = {
  api: { bodyParser: false }
};

function getPath(req) {
  const url = req.url.split('?')[0];
  return url.replace(/^\/api\/import\/?/, '').split('/').filter(Boolean).join('/');
}

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseJSON(raw) {
  try { return JSON.parse(raw.toString()); } catch { return null; }
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const Busboy = require('busboy');
    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: 20 * 1024 * 1024 }
    });

    let fileBuffer = null;
    let fileMime = null;

    busboy.on('file', (fieldname, stream, info) => {
      fileMime = info.mimeType;
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    busboy.on('finish', () => resolve({ buffer: fileBuffer, mimeType: fileMime }));
    busboy.on('error', reject);

    req.pipe(busboy);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = requireAuth(req, res);
  if (!user) return;

  const path = getPath(req);

  if (path === 'pdf') {
    try {
      const { buffer, mimeType } = await parseMultipart(req);

      if (!buffer) return res.status(400).json({ error: 'Nenhum arquivo PDF enviado' });
      if (mimeType !== 'application/pdf') return res.status(400).json({ error: 'Apenas arquivos PDF sao aceitos' });

      const { text, pages, info } = await extractTextFromBuffer(buffer);

      if (!text || text.trim().length < 10) {
        return res.status(422).json({
          error: 'Nao foi possivel extrair texto do PDF. O arquivo pode ser uma imagem escaneada.',
          dica: 'Tente copiar e colar o texto manualmente usando o modo Copy-Paste.'
        });
      }

      const parsed = parseRawText(text);
      return res.json({
        modo: 'pdf',
        paginas: pages,
        info: { titulo: info.Title || null, autor: info.Author || null, criado: info.CreationDate || null },
        texto_extraido: text,
        detectado: parsed,
        mensagem: 'Texto extraido do PDF com sucesso. Revise os campos e confirme para salvar. O PDF NAO foi armazenado.'
      });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao processar PDF: ' + err.message });
    }
  }

  // For non-PDF routes, parse JSON body manually since bodyParser is disabled
  const raw = await getRawBody(req);
  const body = parseJSON(raw) || {};

  if (path === 'text' || path === 'confirm') {
    try {
      const required = ['numero', 'orgao', 'assunto', 'data_emissao'];
      for (const field of required) {
        if (!body[field]) return res.status(400).json({ error: `Campo obrigatorio: ${field}` });
      }
      const parecer = await createParecer(body);
      if (path === 'confirm') {
        return res.status(201).json({ success: true, parecer });
      }
      return res.status(201).json(parecer);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (path === 'paste') {
    try {
      const { texto } = body;
      if (!texto || !texto.trim()) {
        return res.status(400).json({ error: 'Texto nao pode ser vazio' });
      }
      const parsed = parseRawText(texto);
      return res.json({
        modo: 'paste',
        detectado: parsed,
        mensagem: 'Dados extraidos automaticamente. Revise e confirme para salvar.'
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(404).json({ error: 'Endpoint nao encontrado' });
};
