import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rotas que requerem autenticação
 * Redireciona para /login se o usuário não estiver autenticado
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Aguardar o carregamento inicial do estado de autenticação
  while (authService.isLoading()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Salvar a URL que o usuário tentou acessar
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
