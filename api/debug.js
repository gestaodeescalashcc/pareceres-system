module.exports = async function handler(req, res) {
  res.json({
    url: req.url,
    method: req.method,
    query: req.query,
    headers: { host: req.headers.host }
  });
};
