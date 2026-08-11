import express, {Request, Response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './config/database'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middewares
app.use(cors())
app.use(express.json())

// Rota de Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        mensagem: 'Servidor backend rodando com sucesso',
        timestamp: new Date().toISOString()
    });
})

async function main() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o PostgreSQL no supabase feita com sucesso. ')

        app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`)
        console.log(`Health Check disponivel em: http://localhost:${PORT}/api/health`)
    })
    } catch(error) {
        console.log('Erro ao conectar com o BD: ', error)
    }
}

main();
