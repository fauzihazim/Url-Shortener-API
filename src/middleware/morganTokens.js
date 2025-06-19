export const messageToken = (req, res) => {
  return res.body?.message || res.body?.error || "";
};

export const userIdToken = (req, res) => {
  return res.locals.userId || "";
};

export const responseBodyToken = (req, res) => {
  return JSON.stringify(res.body) || "";
};

export const dateTimeNow = (req, res) => {
  return res.locals.dateTimeNow || "";
}