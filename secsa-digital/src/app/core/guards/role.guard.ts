import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../data/interfaces/user.interface';
import { ToastService } from '../services/toast.service';

/**
 * Guard para controlar acesso baseado em roles de usuário
 * Usa: canActivate: [roleGuard], data: { roles: ['admin', 'funcionario'] }
 */
export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  // Aguardar o carregamento inicial do estado de autenticação
  while (authService.isLoading()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  // Se não há roles especificadas, permitir acesso
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Verificar se o usuário tem alguma das roles permitidas
  if (authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  // Usuário não tem permissão
  toastService.error('Você não tem permissão para acessar esta página');
  
  // Redirecionar baseado no role do usuário
  const userRole = authService.userRole();
  if (userRole === 'paciente') {
    return router.createUrlTree(['/meus-exames']);
  } else if (userRole === 'admin' || userRole === 'funcionario') {
    return router.createUrlTree(['/dashboard']);
  } else {
    return router.createUrlTree(['/']);
  }
};
