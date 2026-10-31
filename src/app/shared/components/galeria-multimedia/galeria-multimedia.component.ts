import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonIcon } from '@ionic/angular/ion-icon';
import { addIcons } from 'ionicons';
import { chevronBack, chevronForward, play } from 'ionicons/icons';
import { extraerIdYoutube } from '../../../core/utils/youtube';

/**
 * Carrusel con la portada y, si existe, el tráiler de YouTube.
 * El iframe del vídeo solo se crea cuando la persona pulsa reproducir.
 */
@Component({
  selector: 'app-galeria-multimedia',
  standalone: true,
  imports: [NgOptimizedImage, IonIcon],
  templateUrl: './galeria-multimedia.component.html',
  styleUrl: './galeria-multimedia.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaleriaMultimediaComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private inicioToqueX: number | null = null;

  readonly titulo = input.required<string>();
  readonly portadaUrl = input<string | null | undefined>(null);
  readonly trailerUrl = input<string | null | undefined>(null);

  readonly indice = signal(0);
  readonly reproduciendo = signal(false);

  readonly idTrailer = computed(() => extraerIdYoutube(this.trailerUrl()));
  readonly totalDiapositivas = computed(() => (this.idTrailer() ? 2 : 1));
  readonly miniaturaTrailer = computed(() => {
    const id = this.idTrailer();
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  });
  readonly urlVideo = computed<SafeResourceUrl | null>(() => {
    const id = this.idTrailer();
    return id
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
        )
      : null;
  });
  readonly descripcionActual = computed(() =>
    this.indice() === 0 ? 'Mostrando la portada' : 'Mostrando el tráiler'
  );

  constructor() {
    addIcons({ chevronBack, chevronForward, play });
  }

  anterior(): void {
    this.mover(-1);
  }

  siguiente(): void {
    this.mover(1);
  }

  reproducir(): void {
    this.reproduciendo.set(true);
  }

  teclaPulsada(evento: KeyboardEvent): void {
    if (this.totalDiapositivas() < 2) {
      return;
    }
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      this.anterior();
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      this.siguiente();
    }
  }

  empezarToque(evento: TouchEvent): void {
    this.inicioToqueX = evento.touches[0]?.clientX ?? null;
  }

  terminarToque(evento: TouchEvent): void {
    const final = evento.changedTouches[0]?.clientX;
    if (this.inicioToqueX === null || final === undefined || this.totalDiapositivas() < 2) {
      this.inicioToqueX = null;
      return;
    }
    const desplazamiento = final - this.inicioToqueX;
    this.inicioToqueX = null;
    if (Math.abs(desplazamiento) > 50) {
      this.mover(desplazamiento < 0 ? 1 : -1);
    }
  }

  private mover(paso: number): void {
    const total = this.totalDiapositivas();
    if (total < 2) {
      return;
    }
    this.reproduciendo.set(false);
    this.indice.update((actual) => (actual + paso + total) % total);
  }
}
