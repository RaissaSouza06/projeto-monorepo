import express, {Request, Response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

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
        timeStamp: new Date().toISOString() // Data e hora exatas da requisição
    })
})

// Faz o servidor "ouvir" as requisições na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
    console.log(`Health Check disponivel em: http://localhost:${PORT}/api/health`)
})