// Importa a classe Sequelize da biblioteca de ORM 
import { Sequelize } from "sequelize";
// Importa a biblioteca dotenv para conseguir ler as variáveis protegidas do arquivo .env
import dotenv from 'dotenv'

// Executa a configuração do dotenv para carregar as variáveis de ambiente no processo do Node.js
dotenv.config();

// Cria e exporta a instância de conexão com o banco de dados usando o Sequelize
export const sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        logging: false,
        // Configurações específicas exigidas pelo protocolo de segurança do banco
        dialectOptions: {
            ssl: {
                // Obriga o uso de conexão segura/criptografada (obrigatório para bancos em nuvem como o Supabase)
                require: true,
                // Evita bloqueios de conexão caso o certificado SSL do servidor seja auto-assinado ou não verificado
                rejectUnauthorized: false
            }
        }
    }
)