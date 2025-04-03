const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    let token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Le token est obligatoire pour l'authentification" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }
}

module.exports = { verifyToken };
