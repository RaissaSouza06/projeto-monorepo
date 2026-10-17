import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
} from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../app';
import { sequelize } from '../config/database';
import { User } from '../models/User';

describe('Testes de Integração: AuthController (POST /api/auth/login)', () => {
  beforeAll(async () => {
    // Recria as tabelas no SQLite em memória
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Limpa usuários entre os testes
    await User.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('deve retornar 400 quando email e senha não forem enviados', async () => {
    // Act
    const response = await request(app).post('/api/auth/login').send({});

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Email e senha são obrigatórios');
  });

  it('deve retornar 400 quando apenas o email for enviado', async () => {
    // Act
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aluno@fatec.sp.gov.br' });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Email e senha são obrigatórios');
  });

  it('deve retornar 400 quando apenas a senha for enviada', async () => {
    // Act
    const response = await request(app)
      .post('/api/auth/login')
      .send({ password: 'senha123' });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Email e senha são obrigatórios');
  });

  it('deve retornar 401 quando o usuário não existir no banco', async () => {
    // Act
    const response = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@email.com',
      password: 'qualquerSenha123',
    });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Credenciais invalidas.');
  });

  it('deve retornar 401 quando a senha estiver errada', async () => {
    // Arrange: Cadastra usuário com senha conhecida
    const senha_hash = await bcrypt.hash('senhaCorreta123', 10);
    await User.create({
      nome: 'Aluno Teste',
      email: 'aluno@fatec.sp.gov.br',
      senha_hash,
    });

    // Act: Tenta login com senha errada
    const response = await request(app).post('/api/auth/login').send({
      email: 'aluno@fatec.sp.gov.br',
      password: 'senhaErrada999',
    });

    // Assert
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('erro');
    expect(response.body.erro).toBe('Credenciais invalidas.');
  });

  it('deve retornar 200 e um token JWT ao realizar login com credenciais válidas', async () => {
    // Arrange: Cadastra usuário com hash da senha
    const senha_hash = await bcrypt.hash('senhaForte123', 10);
    await User.create({
      nome: 'Professora Ana',
      email: 'ana@fatec.sp.gov.br',
      senha_hash,
    });

    // Act
    const response = await request(app).post('/api/auth/login').send({
      email: 'ana@fatec.sp.gov.br',
      password: 'senhaForte123',
    });

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'mensagem',
      'Login realizado com sucesso!',
    );
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.length).toBeGreaterThan(0);
  });

  it('deve retornar 200 mesmo com espaços extras no email (trim + lowercase)', async () => {
    // Arrange
    const senha_hash = await bcrypt.hash('Senha@456', 10);
    await User.create({
      nome: 'Carlos Trim',
      email: 'carlos@fatec.sp.gov.br',
      senha_hash,
    });

    // Act: Envia email com letra maiúscula e espaços
    const response = await request(app).post('/api/auth/login').send({
      email: '  CARLOS@fatec.sp.gov.br  ',
      password: 'Senha@456',
    });

    // Assert: O controller deve normalizar o email antes de buscar
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});

// Testes isolados com mock para cobrir o branch de erro 500
describe('AuthController: branch de erro interno (500)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 500 quando ocorrer um erro inesperado no banco', async () => {
    // Arrange: Mock do User.findOne para lançar erro
    vi.spyOn(User, 'findOne').mockRejectedValueOnce(
      new Error('Falha de conexão com o banco'),
    );

    // Act
    const response = await request(app).post('/api/auth/login').send({
      email: 'aluno@fatec.sp.gov.br',
      password: 'senha123',
    });

    // Assert
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('erro');

    vi.restoreAllMocks();
  });
});
