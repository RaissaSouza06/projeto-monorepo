// src/contexts/AuthContext.ts
import { createContext } from 'react';
import type { AuthContextType } from '../types/auth';

// Criamos o contexto com valor inicial indefinido
export const AuthContext = createContext<AuthContextType | undefined>(undefined);