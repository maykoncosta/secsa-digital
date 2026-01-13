export type UserRole = 'admin' | 'funcionario' | 'paciente';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Campos específicos para paciente
  cpf?: string;
  dataNascimento?: Date;
  telefone?: string;
  
  // Campos de auditoria
  active: boolean;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  displayName: string;
  role: UserRole;
  cpf?: string;
  dataNascimento?: Date;
  telefone?: string;
}
