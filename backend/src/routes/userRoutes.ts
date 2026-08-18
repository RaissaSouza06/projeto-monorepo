import { Router, Request, Response } from "express";
import { User } from "../models/User";

const router = Router();

// GET /api/users - Listar todos os usuários
router.get('/', async (req:Request, res:Response) => {
    try {
        const usuarios = await User.findAll({
            attributes: ['id', 'nome', 'email', 'createdAt']
        });
        return res.status(200).json(usuarios);
    } catch(error: any){
        return res.status(500).json({erro: 'Erro ao listar os usuários.', detalhe: error.mensage})
    }
})

// GET BY ID /api/users - Listar usuário por id
router.get('/:id', async (req:Request, res:Response) => {
    try {
        const { id } = req.params;
        const usuario = await User.findByPk(Number(id), {
            attributes: ['id', 'nome', 'email', 'createdAt']
        });
        if (!usuario){
            return res.status(404).json({erro: 'Usuário não encontrado'})
        };
        return res.status(200).json({usuario})
    } 
    catch(error: any){
        return res.status(500).json({erro: 'Erro ao buscar usuário.', detalhe: error.mensage})
    }
})

// POST /api/users - Cadastrar novo usuário
router.post('/', async (req: Request, res:Response) => {
    try {
        const {nome, email, senha_hash} = req.body;
            if (!nome || !email || !senha_hash){
                return res.status(400).json({erro: 'nome, email, senha_hash são obrigatórios'})
            } 
        const novoUsuario = await User.create({nome, email, senha_hash});
        return res.status(201).json(novoUsuario)
    } catch(error: any){
        return res.status(500).json({erro: 'Erro ao cadastrar o usuário.', detalhe: error.mensage})
    }
});

export {router as userRoutes}