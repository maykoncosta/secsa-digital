import { Injectable, inject, signal, computed } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  user,
  User,
  updateProfile,
  onAuthStateChanged
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AppUser, LoginCredentials, RegisterData, UserRole } from '../../data/interfaces/user.interface';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // Signals
  private currentUserSignal = signal<AppUser | null>(null);
  private loadingSignal = signal<boolean>(true);

  // Computed
  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  isLoading = computed(() => this.loadingSignal());
  userRole = computed(() => this.currentUserSignal()?.role);
  isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');
  isFuncionario = computed(() => this.currentUserSignal()?.role === 'funcionario');
  isPaciente = computed(() => this.currentUserSignal()?.role === 'paciente');

  constructor() {
    this.initAuthStateListener();
  }

  /**
   * Inicializa o listener de estado de autenticação
   */
  private initAuthStateListener(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await this.getUserData(firebaseUser.uid);
          if (appUser && appUser.active) {
            this.currentUserSignal.set(appUser);
            await this.updateLastLogin(firebaseUser.uid);
          } else {
            this.currentUserSignal.set(null);
            if (appUser && !appUser.active) {
              this.toastService.error('Sua conta está desativada. Entre em contato com o administrador.');
              await this.logout();
            }
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          this.currentUserSignal.set(null);
        }
      } else {
        this.currentUserSignal.set(null);
      }
      this.loadingSignal.set(false);
    });
  }

  /**
   * Busca dados do usuário no Firestore
   */
  private async getUserData(uid: string): Promise<AppUser | null> {
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data['email'],
        displayName: data['displayName'],
        role: data['role'] as UserRole,
        photoURL: data['photoURL'],
        cpf: data['cpf'],
        cns: data['cns'],
        dataNascimento: data['dataNascimento']?.toDate(),
        telefone: data['telefone'],
        pacienteId: data['pacienteId'], // Vínculo com a collection pacientes
        active: data['active'] ?? true,
        createdAt: data['createdAt']?.toDate() || new Date(),
        updatedAt: data['updatedAt']?.toDate() || new Date(),
        lastLogin: data['lastLogin']?.toDate()
      } as AppUser;
    }
    return null;
  }

  /**
   * Atualiza a data do último login
   */
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(this.firestore, 'users', uid), {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
    }
  }

  /**
   * Realiza login com email e senha
   */
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      this.loadingSignal.set(true);
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      const appUser = await this.getUserData(userCredential.user.uid);
      
      if (!appUser) {
        throw new Error('Dados do usuário não encontrados');
      }

      if (!appUser.active) {
        await this.logout();
        throw new Error('Sua conta está desativada');
      }

      this.currentUserSignal.set(appUser);
      this.toastService.success(`Bem-vindo, ${appUser.displayName}!`);
      
      // Redirecionar baseado no role
      this.redirectAfterLogin(appUser.role);
    } catch (error: any) {
      console.error('Erro no login:', error);
      this.handleAuthError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Login de paciente com CPF/CNS e data de nascimento
   * Converte CPF/CNS para email virtual antes de fazer login
   * Aceita data em vários formatos: DDMMAAAA, DD/MM/AAAA, DD-MM-AAAA, AAAA-MM-DD
   */
  async loginPaciente(cpfOuCns: string, dataNascimento: string): Promise<void> {
    try {
      this.loadingSignal.set(true);
      
      // Remover formatação do CPF/CNS
      const documentoLimpo = cpfOuCns.replace(/\D/g, '');
      
      // Gerar email virtual
      const email = `paciente_${documentoLimpo}@secsa.local`;
      
      // Converter data de nascimento para senha (DDMMAAAA)
      let senha = '';
      
      // Remover qualquer formatação da data
      const dataLimpa = dataNascimento.replace(/\D/g, '');
      
      if (dataLimpa.length === 8) {
        // Se já está no formato DDMMAAAA ou AAAAMMDD
        // Tentar detectar qual é
        const primeirosDois = parseInt(dataLimpa.substring(0, 2));
        
        if (primeirosDois > 31) {
          // Provavelmente AAAAMMDD, converter para DDMMAAAA
          const ano = dataLimpa.substring(0, 4);
          const mes = dataLimpa.substring(4, 6);
          const dia = dataLimpa.substring(6, 8);
          senha = `${dia}${mes}${ano}`;
        } else {
          // Já está em DDMMAAAA
          senha = dataLimpa;
        }
      } else if (dataNascimento.includes('-')) {
        // Formato AAAA-MM-DD
        const [ano, mes, dia] = dataNascimento.split('-');
        senha = `${dia}${mes}${ano}`;
      } else if (dataNascimento.includes('/')) {
        // Formato DD/MM/AAAA
        const [dia, mes, ano] = dataNascimento.split('/');
        senha = `${dia}${mes}${ano}`;
      } else {
        throw new Error('Formato de data inválido');
      }
      
      console.log('🔐 Login de paciente:', { 
        documento: documentoLimpo, 
        email,
        senhaGerada: senha
      });
      
      console.log('📧 Email e senha que serão usados no login:');
      console.log('  Email:', email);
      console.log('  Senha:', senha);
      
      // Fazer login com email virtual e senha
      await this.login({
        email,
        password: senha
      });
      
    } catch (error: any) {
      console.error('Erro no login do paciente:', error);
      this.toastService.error('CPF/CNS ou data de nascimento incorretos');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Registra novo usuário
   */
  async register(data: RegisterData): Promise<void> {
    try {
      this.loadingSignal.set(true);
      
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );

      // Atualizar perfil
      await updateProfile(userCredential.user, {
        displayName: data.displayName
      });

      // Criar documento do usuário no Firestore
      const newUserData: any = {
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (data.cpf) newUserData.cpf = data.cpf;
      if (data.dataNascimento) newUserData.dataNascimento = data.dataNascimento;
      if (data.telefone) newUserData.telefone = data.telefone;

      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), newUserData);

      const newUser: AppUser = {
        uid: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        cpf: data.cpf,
        dataNascimento: data.dataNascimento,
        telefone: data.telefone,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.currentUserSignal.set(newUser);
      this.toastService.success('Conta criada com sucesso!');
      this.redirectAfterLogin(newUser.role);
    } catch (error: any) {
      console.error('Erro no registro:', error);
      this.handleAuthError(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Realiza logout
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSignal.set(null);
      this.toastService.info('Você saiu da sua conta');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      this.toastService.error('Erro ao sair da conta');
    }
  }

  /**
   * Verifica se o usuário tem uma role específica
   */
  hasRole(role: UserRole): boolean {
    return this.currentUserSignal()?.role === role;
  }

  /**
   * Verifica se o usuário tem uma das roles especificadas
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.currentUserSignal()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Redireciona após login baseado no role
   */
  private redirectAfterLogin(role: UserRole): void {
    switch (role) {
      case 'admin':
      case 'funcionario':
        this.router.navigate(['/dashboard']);
        break;
      case 'paciente':
        this.router.navigate(['/meus-exames']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  /**
   * Trata erros de autenticação
   */
  private handleAuthError(error: any): void {
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/user-not-found': 'Email ou senha incorretos',
      'auth/wrong-password': 'Email ou senha incorretos',
      'auth/email-already-in-use': 'Este email já está em uso',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde'
    };

    const message = errorMessages[error.code] || error.message || 'Erro ao processar sua solicitação';
    this.toastService.error(message);
  }
}
