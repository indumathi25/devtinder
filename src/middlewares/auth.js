const adminAuth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token !== 'admin-secret-token') {
    return res.status(403).send('Forbidden');
  }
  next();
};

const userAuth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || token === 'admin-secret-token') {
    return res.status(403).send('Forbidden');
  }
  next();
};

module.exports = { adminAuth, userAuth };
