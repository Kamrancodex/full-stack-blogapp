//404 unsupported
function notFound(req, res, next) {
  const error = new Error(`not found${req.originalUrl}`);
  res.status(404);
  next(error);
}

//handle errors
function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ msg: error.message || "unknown error occured" });
}

module.exports = { notFound, errorHandler };
