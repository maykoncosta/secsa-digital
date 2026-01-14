import { Directive, ElementRef, HostListener, Input, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay = 300;

  private tooltipElement: HTMLElement | null = null;
  private showTimeout?: number;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipText) return;
    
    this.showTimeout = window.setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.hideTooltip();
  }

  @HostListener('click')
  onClick(): void {
    this.hideTooltip();
  }

  private showTooltip(): void {
    if (this.tooltipElement) return;

    // Criar elemento do tooltip
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'app-tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.tooltipPosition}`);
    
    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipElement, text);
    
    // Adicionar ao body
    this.renderer.appendChild(document.body, this.tooltipElement);
    
    // Posicionar tooltip
    this.positionTooltip();
    
    // Animar entrada
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'tooltip-visible');
      }
    }, 10);
  }

  private hideTooltip(): void {
    if (!this.tooltipElement) return;
    
    this.renderer.removeClass(this.tooltipElement, 'tooltip-visible');
    
    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.removeChild(document.body, this.tooltipElement);
        this.tooltipElement = null;
      }
    }, 150);
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPosX = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostPos.top + scrollPos - tooltipPos.height - 8;
        left = hostPos.left + scrollPosX + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'bottom':
        top = hostPos.bottom + scrollPos + 8;
        left = hostPos.left + scrollPosX + (hostPos.width - tooltipPos.width) / 2;
        break;
      case 'left':
        top = hostPos.top + scrollPos + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.left + scrollPosX - tooltipPos.width - 8;
        break;
      case 'right':
        top = hostPos.top + scrollPos + (hostPos.height - tooltipPos.height) / 2;
        left = hostPos.right + scrollPosX + 8;
        break;
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  ngOnDestroy(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.hideTooltip();
  }
}
