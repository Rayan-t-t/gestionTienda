import { FormControl } from '@angular/forms';
import { firstValueFrom, from, isObservable } from 'rxjs';
import { crearValidadorSku } from './sku-disponible.validator';
import { VideojuegosService } from '../services/videojuegos.service';

describe('crearValidadorSku', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('espera 400 ms, consulta el servicio excluyendo el registro y marca el duplicado', async () => {
    vi.useFakeTimers();
    const existeSku = vi.fn(() => from([true]));
    const servicio: Pick<VideojuegosService, 'existeSku'> = { existeSku };
    const validador = crearValidadorSku(servicio, () => 12);
    const resultado = validador(new FormControl('  RPG-001  '));

    if (resultado === null) {
      throw new Error('El validador debe devolver un resultado asíncrono para un SKU informado.');
    }
    const validacion = firstValueFrom(isObservable(resultado) ? resultado : from(resultado));

    expect(existeSku).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(400);

    await expect(validacion).resolves.toEqual({ skuDuplicado: true });
    expect(existeSku).toHaveBeenCalledWith('RPG-001', 12);
  });

  it('omite la consulta cuando el código está vacío', async () => {
    const existeSku = vi.fn(() => from([false]));
    const servicio: Pick<VideojuegosService, 'existeSku'> = { existeSku };
    const resultado = crearValidadorSku(servicio, () => null)(new FormControl('  '));

    if (resultado === null) {
      throw new Error('El validador debe responder con un resultado síncrono.');
    }
    await expect(
      isObservable(resultado) ? firstValueFrom(resultado) : Promise.resolve(resultado)
    ).resolves.toBeNull();
    expect(existeSku).not.toHaveBeenCalled();
  });
});
