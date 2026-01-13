import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rota raiz '/'
 * Redireciona para a página apropriada baseado no estado de autenticação e role
 */
export const homeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Aguardar carregamento do estado de autenticação
  if (authService.isLoading()) {
    return false;
  }

  // Se não está autenticado, redirecionar para login
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Redirecionar baseado no role
  const role = authService.userRole();
  switch (role) {
    case 'admin':
    case 'funcionario':
      router.navigate(['/dashboard']);
      break;
    case 'paciente':
      router.navigate(['/meus-exames']);
      break;
    default:
      router.navigate(['/login']);
  }

  return false;
};
