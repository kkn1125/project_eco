function logger(req, res, next) {
  const { method, url } = req;
  console.log("✳️ LOGGER:", method, url, new Date().toLocaleString("ko"));
  next();
}

export default logger;
