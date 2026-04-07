const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractTextFromBuffer } = require('../services/pdfExtractor');
const { createParecer, parseRawText } = require('../services/indexService');
const { requireAuth } = require('../middleware/auth');

// Memory storage — PDF never touches disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF sao aceitos'));
    }
  }
});

// Mode 1: Direct text import (form data)
router.post('/text', requireAuth, async (req, res) => {
  try {
    const required = ['numero', 'orgao', 'assunto', 'data_emissao'];
    for (const field of required) {
      if (!req.body[field]) return res.status(400).json({ error: `Campo obrigatorio: ${field}` });
    }
    const parecer = await createParecer(req.body);
    res.status(201).json(parecer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mode 2: Paste raw text — auto-structure
router.post('/paste', requireAuth, (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: 'Texto nao pode ser vazio' });
    }

    const parsed = parseRawText(texto);
    // Return structured data for user review — don't save yet
    res.json({
      modo: 'paste',
      detectado: parsed,
      mensagem: 'Dados extraidos automaticamente. Revise e confirme para salvar.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mode 3: PDF upload — extract text in memory, discard PDF
router.post('/pdf', requireAuth, upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo PDF enviado' });
    }

    // Extract text from buffer (PDF is only in memory)
    const { text, pages, info } = await extractTextFromBuffer(req.file.buffer);

    if (!text || text.trim().length < 10) {
      return res.status(422).json({
        error: 'Nao foi possivel extrair texto do PDF. O arquivo pode ser uma imagem escaneada.',
        dica: 'Tente copiar e colar o texto manualmente usando o modo Copy-Paste.'
      });
    }

    // Auto-parse the extracted text
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
});

// Confirm and save (after paste or PDF preview)
router.post('/confirm', requireAuth, async (req, res) => {
  try {
    const required = ['numero', 'orgao', 'assunto', 'data_emissao'];
    for (const field of required) {
      if (!req.body[field]) return res.status(400).json({ error: `Campo obrigatorio: ${field}` });
    }
    const parecer = await createParecer(req.body);
    res.status(201).json({ success: true, parecer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
