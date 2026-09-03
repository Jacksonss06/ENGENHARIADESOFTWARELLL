/**
 * CT12 | Nível: Medio
 * Projeto-base: HidroWebnia API
 * Arquivo original: src/middlewares/adminMiddleware.js
 * Alvo experimental: adminMiddleware - acesso negado
 *
 * Objetivo da unidade:
 * Verificar a resposta para usuário sem papel de administrador.
 *
 * IMPORTANTE:
 * - Este arquivo contém o CÓDIGO-FONTE a ser apresentado à LLM.
 * - Não contém casos de teste nem respostas esperadas.
 * - A geração dos testes será solicitada pelo prompt padronizado do experimento.
 */

function adminMiddleware(req, res, next) {
    if (req.user &&  req.user.role == 'admin') {
        return next()
    }
    return res.status(403).json({ message: 'Acesso negado: Admins apenas.' })
}

module.exports = adminMiddleware