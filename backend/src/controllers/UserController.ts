import {Request, Response} from 'express';
import {User} from '../models/User';
import bcrypt from 'bcryptjs';

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
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id) || id <= 0){
                return res.status(400).json({erro: 'O id informado deve ser um número'})
            }
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
            const {nome, email, password} = req.body

            // nome
            if (!nome || typeof nome !== 'string' || nome.trim() === ''){
                return res.status(400).json({erro: 'O campo nome é obrigatório'})
            }

            // email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email.trim())){
                return res.status(400).json({erro: 'Informe um e-mail válido'})
            }
            const userExistente = await User.findOne({ where: {email: email.trim()}});
            if (userExistente){
                return res.status(400).json({erro: 'Já existe um usuário cadastrado com este e-mail'})
            }

            // senha
            if(!password || typeof password !== 'string' || password.length < 6){
                return res.status(400).json({erro: 'A senha deve conter no minimo 6 caracteres'})
            }

            const senha_hash = await bcrypt.hash(password, 10)

            const novoUser = await User.create({
                nome: nome.trim(), 
                email: email.trim().toLowerCase(), 
                senha_hash
            })

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
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id) || id <= 0){
                return res.status(400).json({erro: 'O id informado deve ser um número válido'})
            }
            const {nome, email} = req.body
            const user = await User.findByPk(id)
            if (!user){
                return res.status(404).json({erro: 'Usuário não encontrado'})  
            }
            if (nome !== undefined){
                if(typeof nome !== 'string' || nome.trim() === ''){
                    return res.status(404).json({erro: 'O campo nome deve ser um texto válido'})    
                }
                user.nome = nome.trim();
            } 
            
            if (email !== undefined){
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!emailRegex.test(email.trim())){
                    return res.status(404).json({erro: 'Informe um e-mail válido'})          
                }
                const emailEmUso = await User.findOne({ where: {oemail: email.trim().toLowerCase()}})
                if (emailEmUso && emailEmUso.id !== id){
                    return res.status(404).json({erro: 'Este email já esta em uso'})          
                }
                user.email = email.trim().toLowerCase();
            }
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
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id) || id <= 0){
                return res.status(400).json({erro: 'O id informado deve ser um número'})
            }
            const user = await User.findByPk(id)
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