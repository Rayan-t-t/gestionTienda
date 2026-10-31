import { TestBed } from '@angular/core/testing';
import { TemaService } from './tema.service';

describe('TemaService', () => {
  const esOscuro = (): boolean => document.documentElement.classList.contains('ion-palette-dark');

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('ion-palette-dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('ion-palette-dark');
  });

  it('recupera el tema oscuro guardado al iniciar', () => {
    localStorage.setItem('tema', 'oscuro');

    const servicio = TestBed.inject(TemaService);

    expect(servicio.oscuro()).toBe(true);
    expect(esOscuro()).toBe(true);
  });

  it('respeta el tema claro guardado', () => {
    localStorage.setItem('tema', 'claro');

    const servicio = TestBed.inject(TemaService);

    expect(servicio.oscuro()).toBe(false);
    expect(esOscuro()).toBe(false);
  });

  it('alterna el tema, actualiza la clase del documento y guarda la elección', () => {
    localStorage.setItem('tema', 'claro');
    const servicio = TestBed.inject(TemaService);

    servicio.alternar();
    expect(servicio.oscuro()).toBe(true);
    expect(esOscuro()).toBe(true);
    expect(localStorage.getItem('tema')).toBe('oscuro');

    servicio.alternar();
    expect(servicio.oscuro()).toBe(false);
    expect(esOscuro()).toBe(false);
    expect(localStorage.getItem('tema')).toBe('claro');
  });
});
