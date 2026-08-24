import {Request, Response} from 'express';
import {User} from '../models/User';

export class UserController{
    // GET /api/Users - lista todos os usuários
    public static async index(req: Request, res:Response): Promise<Response>{
        try {
            const users = await User.findAll({
                attributes: ['id', 'nome', 'email', 'createdAt', 'updatedAt']
            })
            return res.status(200).json(users)
        } catch(error:any){
            return res.status(500).json({erro: 'Erro ao listar usuários',
                detalhe: error.mensage
            })
        }
    }

    // GET /api/User/:id - Busca um usuário pelo ID
    public static async show(req: Request, res:Response): Promise<Response>{
        try {
            const {id} = req.params
            const user = await User.findByPk(Number(id),{
                attributes: ['id', 'nome', 'email', 'createdAt', 'updatedAt']
            })
            if(!user){
                return res.status(404).json({erro: 'Usuário não encontrado'})
            }
            return res.status(200).json(user)
        } catch(error:any){
            return res.status(500).json({erro: 'Erro ao buscar usuário',
                detalhe: error.mensage
            })
        }
    }

    // POST /api/Users - Cadastrar um novo usuário
    public static async create(req: Request, res:Response): Promise<Response>{
        try {
            const {nome, email, senha_hash} = req.body
            if(!nome || !email || !senha_hash){
                return res.status(400).json({erro: 'Os campos nome, email e senha são obrigatórios'})
            }
            const novoUser = await User.create({nome, email, senha_hash})
            return res.status(201).json({
                id: novoUser.id,
                nome: novoUser.nome,
                email: novoUser.email,
                createdAt: novoUser.createdAt
            })
        } catch(error:any){
            return res.status(500).json({erro: 'Erro ao cadastrar o usuário',
                detalhe: error.mensage
            })
        }
    }

    // PUT /api/Users/:id  - Atualizar um usuário existente
    public static async update(req: Request, res:Response): Promise<Response>{
        try {
            const {id} = req.params
            const {nome, email} = req.body
            const user = await User.findByPk(Number(id))
            if (!user){
              return res.status(404).json({erro: 'Usuário não encontrado'})  
            }
            if (nome) user.nome = nome;
            if (email) user.email = email;
            await user.save()
            return res.status(200).json({
                id: user.id,
                nome: user.nome,
                email: user.email,
                createdAt: user.createdAt
            })
        } catch(error:any){
            return res.status(500).json({erro: 'Erro ao atualizar o usuário',
                detalhe: error.mensage
            })
        }
    }

    // DELETE /api/Users/:id  - Remove um usuário 
    public static async delete(req: Request, res:Response): Promise<Response>{
        try {
            const {id} = req.params
            const user = await User.findByPk(Number(id))
            if (!user){
              return res.status(404).json({erro: 'Usuário não encontrado'})  
            }
            await user.destroy();
            return res.status(204).send()
        } catch(error:any){
            return res.status(500).json({erro: 'Erro ao excluir o usuário',
                detalhe: error.mensage
            })
        }
    }
}