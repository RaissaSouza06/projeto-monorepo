import express, {Request, Response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './config/database'
import { User } from './models/User'
import { appRoutes } from './routes'

// Carrega as variáveis de ambiente do arquivo .env para dentro do process.env
dotenv.config()

const app = express()

// Define a porta do servidor: usa a que estiver no .env ou assume a porta 3000 por padrão
const PORT = process.env.PORT || 3000

// Middlewares globais
app.use(cors())            // Libera o acesso de outras origens/front-ends à sua API
app.use(express.json())    // Ensina o servidor a entender dados enviados no formato JSON (corpo das requisições)

// Rota de Health Check (Verificação de Saúde)
app.get('/api/health', (req: Request, res: Response) => {
    // Responde com status 200 (OK) e um objeto JSON informando que a API está viva
    res.status(200).json({
        status: 'OK',
        mensagem: 'Servidor backend rodando com sucesso',
        timestamp: new Date().toISOString()
    });
});


// Rota para cadastrar novo usuário
app.post('/api/users', async (req: Request, res:Response) => {
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

// Rota para listar todos os usuários 
app.get('/api/users', async (req:Request, res:Response) => {
    try {
        const usuarios = await User.findAll({
            attributes: ['id', 'nome', 'email', 'createdAt']
        });
        return res.status(200).json(usuarios);
    } catch(error: any){
        return res.status(500).json({erro: 'Erro ao listar os usuários.', detalhe: error.mensage})
    }
})

// Faz o servidor "ouvir" as requisições na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
    console.log(`Health Check disponivel em: http://localhost:${PORT}/api/health`)
})