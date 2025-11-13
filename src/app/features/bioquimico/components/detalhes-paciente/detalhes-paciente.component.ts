import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PacienteService } from '../../services/paciente.service';
import { Usuario } from '../../../../core/models';
import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';
import { CnsPipe } from '../../../../shared/pipes/cns.pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone.pipe';

@Component({
  selector: 'app-detalhes-paciente',
  standalone: true,
  imports: [CommonModule, CpfPipe, CnsPipe, TelefonePipe],
  templateUrl: './detalhes-paciente.component.html',
  styleUrl: './detalhes-paciente.component.scss'
})
export class DetalhesPacienteComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private pacienteService = inject(PacienteService);

  paciente?: Usuario;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.carregarPaciente(id);
      }
    });
  }

  carregarPaciente(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.pacienteService.buscarPorId(id).subscribe({
      next: (paciente) => {
        if (paciente) {
          this.paciente = paciente;
        } else {
          this.errorMessage = 'Paciente não encontrado.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar paciente:', error);
        this.errorMessage = 'Erro ao carregar paciente. Por favor, tente novamente.';
        this.isLoading = false;
      }
    });
  }

  calcularIdade(dataNascimento: Date): number {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  }

  getDataCriacao(): Date | null {
    if (!this.paciente?.criadoEm) return null;
    return this.paciente.criadoEm instanceof Date ? this.paciente.criadoEm : new Date(this.paciente.criadoEm as any);
  }

  getDataAtualizacao(): Date | null {
    if (!this.paciente?.atualizadoEm) return null;
    return this.paciente.atualizadoEm instanceof Date ? this.paciente.atualizadoEm : new Date(this.paciente.atualizadoEm as any);
  }

  editar(): void {
    if (this.paciente) {
      this.router.navigate(['/bioquimico/pacientes/editar', this.paciente.uid]);
    }
  }

  voltar(): void {
    this.router.navigate(['/bioquimico/pacientes']);
  }
}
