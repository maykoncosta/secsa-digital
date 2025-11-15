import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-paciente-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './paciente-layout.component.html',
  styleUrl: './paciente-layout.component.scss'
})
export class PacienteLayoutComponent {
  private router = inject(Router);

  // TODO: Pegar do Auth depois
  paciente = {
    nome: 'João da Silva',
    cpf: '123.456.789-00'
  };

  logout(): void {
    // TODO: Implementar logout real
    this.router.navigate(['/']);
  }
}
