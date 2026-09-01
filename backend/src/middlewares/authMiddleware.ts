import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth";

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    try{
        const authHeader = req.headers.authorization;

        // verifica se o token foi enviado no formato correto (Bearer <token>)
        if (!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({erro: 'Token não fornecido.'})
        }

        const token = authHeader.split(' ')[1];

        // válida a assinatura matemática do token com a chave secreta
        const usuarioDecodificado = jwt.verify(token, JWT_SECRET);

        // salva os dados do usuário na requisição
        (req as any).user = usuarioDecodificado;

        return next();
    } catch (error: any){ 
        return res.status(401).json({erro: 'Token inválido ou expirado'})
    }
}