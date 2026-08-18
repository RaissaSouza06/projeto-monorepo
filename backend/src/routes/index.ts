import { Router } from "express";
import { userRoutes } from "./userRoutes";

const router = Router();

// Registra as rotas de usuário sob prefixo / user
router.use('/users', userRoutes)

export { router as appRoutes};