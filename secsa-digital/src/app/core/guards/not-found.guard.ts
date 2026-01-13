import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rotas não encontradas
 * Se não autenticado → redireciona para /login
 * Se autenticado → permite ver a página 404
 */
export const notFoundGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Aguardar o carregamento do estado de autenticação
  if (authService.isLoading()) {
    // Tentar novamente em breve
    setTimeout(() => {
      if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
      }
    }, 100);
    return false;
  }

  // Se não está autenticado, redirecionar para login
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Se está autenticado, permitir acesso à página 404
  return true;
};
