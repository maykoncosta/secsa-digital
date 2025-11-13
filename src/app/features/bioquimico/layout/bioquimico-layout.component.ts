import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bioquimico-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './bioquimico-layout.component.html',
  styleUrl: './bioquimico-layout.component.scss'
})
export class BioquimicoLayoutComponent {
  menuAberto = true;

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }
}
