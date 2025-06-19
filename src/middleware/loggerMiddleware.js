export const logger = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    res.body = data;
    originalJson.call(this, data);
  };
  next();
};