import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, Timestamp, serverTimestamp, doc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Paciente } from '../../data/interfaces/paciente.interface';

@Injectable({
  providedIn: 'root'
})
export class PacienteUserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private functions = inject(Functions);

  /**
   * Cria usuário automaticamente para o paciente usando Cloud Function
   * Não faz login automático - o admin/funcionário continua logado
   */
  async criarUsuarioParaPaciente(paciente: Paciente, pacienteId: string): Promise<string | null> {
    try {
      // Preparar dados do paciente para enviar à Cloud Function
      const pacienteData = {
        nomeCompleto: paciente.nomeCompleto,
        cpf: paciente.cpf,
        cns: paciente.cns,
        dataNascimento: paciente.dataNascimento instanceof Date 
          ? paciente.dataNascimento.toISOString()
          : (paciente.dataNascimento as any).toDate().toISOString(),
        telefone: paciente.telefone
      };

      console.log('📧 Chamando Cloud Function para criar usuário...', {
        pacienteId,
        documento: paciente.cpf || paciente.cns
      });

      // Chamar Cloud Function
      const criarUsuario = httpsCallable(this.functions, 'criarUsuarioPaciente');
      const result = await criarUsuario({
        paciente: pacienteData,
        pacienteId
      });

      const data = result.data as any;

      if (data.success) {
        console.log('✅ Usuário criado com sucesso!', {
          uid: data.uid,
          email: data.email
        });
        return data.uid || null;
      }

      return null;
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário para paciente:', error);
      // Não lançar erro - deixar que o paciente seja criado mesmo sem usuário
      return null;
    }
  }

  /**
   * Atualiza os dados do usuário quando o paciente é editado
   */
  async atualizarUsuarioPaciente(pacienteId: string, dadosAtualizados: Partial<Paciente>): Promise<void> {
    try {
      const { collection, query, where, getDocs, updateDoc } = await import('@angular/fire/firestore');
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('pacienteId', '==', pacienteId));
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('ℹ️ Nenhum usuário vinculado a este paciente');
        return;
      }

      const userDoc = snapshot.docs[0];
      const uid = userDoc.id;

      const updateData: any = {
        updatedAt: serverTimestamp()
      };

      if (dadosAtualizados.nomeCompleto) {
        updateData.displayName = dadosAtualizados.nomeCompleto;
      }
      if (dadosAtualizados.telefone !== undefined) {
        updateData.telefone = dadosAtualizados.telefone;
      }

      await updateDoc(doc(this.firestore, 'users', uid), updateData);
      console.log('✅ Usuário atualizado:', uid);
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário do paciente:', error);
    }
  }

  /**
   * Inativa o usuário quando o paciente é inativado
   */
  async inativarUsuarioPaciente(pacienteId: string): Promise<void> {
    try {
      const { collection, query, where, getDocs, updateDoc } = await import('@angular/fire/firestore');
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('pacienteId', '==', pacienteId));
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(this.firestore, 'users', userDoc.id), {
          active: false,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Usuário inativado');
      }
    } catch (error) {
      console.error('❌ Erro ao inativar usuário:', error);
    }
  }

  /**
   * Ativa o usuário quando o paciente é ativado
   */
  async ativarUsuarioPaciente(pacienteId: string): Promise<void> {
    try {
      const { collection, query, where, getDocs, updateDoc } = await import('@angular/fire/firestore');
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('pacienteId', '==', pacienteId));
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(this.firestore, 'users', userDoc.id), {
          active: true,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Usuário ativado');
      }
    } catch (error) {
      console.error('❌ Erro ao ativar usuário:', error);
    }
  }
}
