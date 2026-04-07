const { extractTextFromBuffer } = require('../../lib/services/pdfExtractor');
const { parseRawText } = require('../../lib/services/indexService');
const { requireAuth } = require('../../lib/auth');

// Disable Vercel's default body parser for multipart
module.exports.config = {
  api: { bodyParser: false }
};

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

  try {
    const { buffer, mimeType } = await parseMultipart(req);

    if (!buffer) {
      return res.status(400).json({ error: 'Nenhum arquivo PDF enviado' });
    }

    if (mimeType !== 'application/pdf') {
      return res.status(400).json({ error: 'Apenas arquivos PDF sao aceitos' });
    }

    const { text, pages, info } = await extractTextFromBuffer(buffer);

    if (!text || text.trim().length < 10) {
      return res.status(422).json({
        error: 'Nao foi possivel extrair texto do PDF. O arquivo pode ser uma imagem escaneada.',
        dica: 'Tente copiar e colar o texto manualmente usando o modo Copy-Paste.'
      });
    }

    const parsed = parseRawText(text);

    res.json({
      modo: 'pdf',
      paginas: pages,
      info: {
        titulo: info.Title || null,
        autor: info.Author || null,
        criado: info.CreationDate || null
      },
      texto_extraido: text,
      detectado: parsed,
      mensagem: 'Texto extraido do PDF com sucesso. Revise os campos e confirme para salvar. O PDF NAO foi armazenado.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao processar PDF: ' + err.message });
  }
};
