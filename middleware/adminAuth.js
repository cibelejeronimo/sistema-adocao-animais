const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

const jwtSecret = process.env.JWT_SECRET || 'supersecret123';

async function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ erro: 'Token não enviado' });
    }

    try {
        const payload = jwt.verify(token, jwtSecret);
        const admin = await Admin.findByPk(payload.id_admin);

        if (!admin) {
            return res.status(401).json({ erro: 'Administrador não autorizado' });
        }

        req.admin = {
            id_admin: admin.id_admin,
            nome: admin.nome,
            email: admin.email
        };

        next();
    } catch (error) {
        console.error('Erro de autenticação de administrador:', error);
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
}

module.exports = adminAuth;
