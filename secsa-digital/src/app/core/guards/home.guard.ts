import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rota raiz '/'
 * Redireciona para a página apropriada baseado no estado de autenticação e role
 */
export const homeGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Aguardar um pouco para o auth state carregar
  await new Promise(resolve => setTimeout(resolve, 100));

  // Se não está autenticado, redirecionar para login
  if (!authService.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  // Redirecionar baseado no role
  const role = authService.userRole();
  switch (role) {
    case 'admin':
    case 'funcionario':
      return router.parseUrl('/dashboard');
    case 'paciente':
      return router.parseUrl('/meus-exames');
    default:
      return router.parseUrl('/login');
  }
};
