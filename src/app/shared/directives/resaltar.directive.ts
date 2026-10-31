import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';

/**
 * Directiva para resaltar elementos al pasar el ratón por encima.
 */
@Directive({
  selector: '[appResaltar]',
  standalone: true
})
export class ResaltarDirective {
  readonly appResaltar = input('#ffd700');
  private readonly elemento = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.renderer.setStyle(
      this.elemento.nativeElement,
      'background-color',
      this.appResaltar()
    );
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.removeStyle(this.elemento.nativeElement, 'background-color');
  }
}
