export const logger = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    res.body = data; // Store response body for Morgan
    originalJson.call(this, data);
  };
  next();
};