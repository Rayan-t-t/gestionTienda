import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { extraerIdYoutube } from '../utils/youtube';

/**
 * Valida que un campo opcional contenga una URL de vídeo de YouTube.
 * Un valor vacío se considera válido.
 */
export function validadorUrlYoutube(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = typeof control.value === 'string' ? control.value.trim() : '';
    return valor === '' || extraerIdYoutube(valor) !== null ? null : { urlYoutube: true };
  };
}
