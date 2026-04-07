const pdfParse = require('pdf-parse');

async function extractTextFromBuffer(buffer) {
  const data = await pdfParse(buffer, {
    max: 0 // no page limit
  });

  let text = data.text || '';

  // Normalize whitespace
  text = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove repeated headers/footers (common in legal PDFs)
    .replace(/(?:Página|Pág\.?|Page)\s*\d+\s*(?:de|of)\s*\d+/gi, '')
    // Remove excessive blank lines
    .replace(/\n{4,}/g, '\n\n\n')
    // Fix broken words at line breaks (hyphenation)
    .replace(/(\w)-\n(\w)/g, '$1$2')
    // Normalize spaces
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return {
    text,
    pages: data.numpages,
    info: data.info || {}
  };
}

module.exports = { extractTextFromBuffer };
