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
    .replace(/(?:Página|Pág\.?|Page)\s*\d+\s*(?:de|of)\s*\d+/gi, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/(\w)-\n(\w)/g, '$1$2')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return {
    text,
    pages: data.numpages,
    info: data.info || {}
  };
}

module.exports = { extractTextFromBuffer };
