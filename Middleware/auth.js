const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private, max-age=0'
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const token = req.cookies?.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
}

module.exports = auth;