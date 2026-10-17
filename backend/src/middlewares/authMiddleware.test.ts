import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './authMiddleware';
import { JWT_SECRET } from '../config/auth';

// Fábricas de mocks para req, res e next
function makeMocks() {
  const req = {
    headers: {},
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  return { req, res, next };
}

describe('Middleware: authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar 401 quando o header Authorization estiver ausente', () => {
    // Arrange
    const { req, res, next } = makeMocks();
    // headers.authorization está undefined

    // Act
    authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o header Authorization não começar com "Bearer "', () => {
    // Arrange
    const { req, res, next } = makeMocks();
    (req.headers as any).authorization = 'Basic dXNlcjpwYXNz';

    // Act
    authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Token não fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 quando o token JWT for inválido ou expirado', () => {
    // Arrange
    const { req, res, next } = makeMocks();
    (req.headers as any).authorization = 'Bearer token.invalido.assinatura';

    // Act
    authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token invalido ou expirado.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() e anexar o usuário decodificado quando o token for válido', () => {
    // Arrange
    const payload = { id: 1, email: 'aluno@fatec.sp.gov.br', nome: 'Aluno' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    const { req, res, next } = makeMocks();
    (req.headers as any).authorization = `Bearer ${token}`;

    // Act
    authMiddleware(req, res, next);

    // Assert: next deve ter sido chamado sem erros
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();

    // O payload decodificado deve estar disponível em req.user
    expect((req as any).user).toBeDefined();
    expect((req as any).user.id).toBe(payload.id);
    expect((req as any).user.email).toBe(payload.email);
  });

  it('deve retornar 401 quando o token JWT estiver expirado', () => {
    // Arrange: Gera um token com expiração no passado
    const payload = {
      id: 2,
      email: 'expirado@fatec.sp.gov.br',
      nome: 'Expirado',
    };
    const tokenExpirado = jwt.sign(payload, JWT_SECRET, { expiresIn: -1 });

    const { req, res, next } = makeMocks();
    (req.headers as any).authorization = `Bearer ${tokenExpirado}`;

    // Act
    authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      erro: 'Token invalido ou expirado.',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
