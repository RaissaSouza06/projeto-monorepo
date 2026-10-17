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
import { app } from '../app';
import { sequelize } from '../config/database';
import { User } from '../models/User';

// Helper: cria um usuário e retorna o id
async function criarUsuario(
  nome: string,
  email: string,
  password = 'Senha@12345',
): Promise<number> {
  const response = await request(app)
    .post('/api/users')
    .send({ nome, email, password });
  return response.body.id;
}

describe('Testes de Integração: UserController – update e delete', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ─── PUT /api/users/:id ───────────────────────────────────────────────────

  describe('PUT /api/users/:id', () => {
    it('deve retornar 400 quando o ID não for um número válido', async () => {
      // Act
      const response = await request(app)
        .put('/api/users/abc')
        .send({ nome: 'Novo Nome' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toBe(
        'O ID informado deve ser um numero valido.',
      );
    });

    it('deve retornar 400 quando o ID for zero', async () => {
      const response = await request(app)
        .put('/api/users/0')
        .send({ nome: 'Novo Nome' });

      expect(response.status).toBe(400);
    });

    it('deve retornar 404 quando o usuário não existir', async () => {
      // Act
      const response = await request(app)
        .put('/api/users/999999')
        .send({ nome: 'Nome Qualquer' });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.erro).toBe('Usuário não encontrado.');
    });

    it('deve atualizar o nome com sucesso e retornar 200', async () => {
      // Arrange
      const id = await criarUsuario('João Original', 'joao@email.com');

      // Act
      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ nome: 'João Atualizado' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.nome).toBe('João Atualizado');
      expect(response.body.email).toBe('joao@email.com');
    });

    it('deve atualizar o email com sucesso e retornar 200', async () => {
      // Arrange
      const id = await criarUsuario('Maria Teste', 'maria@email.com');

      // Act
      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ email: 'maria.nova@email.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.email).toBe('maria.nova@email.com');
    });

    it('deve retornar 404 quando o nome for uma string vazia', async () => {
      // Arrange
      const id = await criarUsuario('Pedro Válido', 'pedro@email.com');

      // Act
      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ nome: '   ' });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toBe('O campo nome deve ser um texto valido.');
    });

    it('deve retornar 400 quando o email informado for inválido', async () => {
      // Arrange
      const id = await criarUsuario('Ana Teste', 'ana@email.com');

      // Act
      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ email: 'formato-invalido' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toBe('Informe um e-mail valido.');
    });

    it('deve retornar 400 quando o email já estiver em uso por outro usuário', async () => {
      // Arrange: Cria dois usuários
      const id1 = await criarUsuario('Usuario Um', 'usuario1@email.com');
      await criarUsuario('Usuario Dois', 'usuario2@email.com');

      // Act: Tenta atribuir o email do segundo ao primeiro
      const response = await request(app)
        .put(`/api/users/${id1}`)
        .send({ email: 'usuario2@email.com' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('erro');
      expect(response.body.erro).toBe('Este e-mail já está em uso.');
    });

    it('deve atualizar o email mesmo que seja o próprio email do usuário (sem conflito)', async () => {
      // Arrange
      const id = await criarUsuario('Fernanda Teste', 'fernanda@email.com');

      // Act: Envia o mesmo email (sem maiúsculas)
      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ email: 'fernanda@email.com' });

      // Assert: Deve ser 200 pois o email pertence ao próprio usuário
      expect(response.status).toBe(200);
      expect(response.body.email).toBe('fernanda@email.com');
    });

    it('deve retornar 500 quando ocorrer erro interno no banco durante update', async () => {
      // Arrange
      const id = await criarUsuario('Erro Teste', 'erro@email.com');
      vi.spyOn(User, 'findByPk').mockRejectedValueOnce(
        new Error('Falha no banco'),
      );

      // Act
      const response = await request(app)
        .put(`/api/users/${id}`)
        .send({ nome: 'Novo Nome' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('erro');

      vi.restoreAllMocks();
    });
  });

  // ─── DELETE /api/users/:id ────────────────────────────────────────────────

  describe('DELETE /api/users/:id', () => {
    it('deve retornar 400 quando o ID não for um número válido', async () => {
      // Act
      const response = await request(app).delete('/api/users/xyz');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.erro).toBe(
        'O ID informado deve ser um numero valido.',
      );
    });

    it('deve retornar 400 quando o ID for zero', async () => {
      const response = await request(app).delete('/api/users/0');

      expect(response.status).toBe(400);
    });

    it('deve retornar 404 quando o usuário não existir', async () => {
      // Act
      const response = await request(app).delete('/api/users/999999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.erro).toBe('Usuário não encontrado.');
    });

    it('deve excluir o usuário com sucesso e retornar 204', async () => {
      // Arrange
      const id = await criarUsuario('Para Excluir', 'excluir@email.com');

      // Act
      const response = await request(app).delete(`/api/users/${id}`);

      // Assert
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verifica que o usuário foi removido do banco
      const verificacao = await request(app).get(`/api/users/${id}`);
      expect(verificacao.status).toBe(404);
    });

    it('deve retornar 500 quando ocorrer erro interno no banco durante delete', async () => {
      // Arrange
      const id = await criarUsuario('Erro Delete', 'errodelete@email.com');
      vi.spyOn(User, 'findByPk').mockRejectedValueOnce(
        new Error('Falha no banco'),
      );

      // Act
      const response = await request(app).delete(`/api/users/${id}`);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('erro');

      vi.restoreAllMocks();
    });
  });
});
