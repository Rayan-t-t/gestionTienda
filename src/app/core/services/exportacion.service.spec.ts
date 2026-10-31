import { VideojuegoListado } from '../models/videojuego.model';
import { ExportacionService } from './exportacion.service';

describe('ExportacionService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('escapa CSV RFC 4180, agrega BOM y neutraliza fórmulas', async () => {
    let blobDescargado: Blob | null = null;
    const crearUrl = vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      if (blob instanceof Blob) {
        blobDescargado = blob;
      }
      return 'blob:csv-test';
    });
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const servicio = new ExportacionService();
    const videojuegos: VideojuegoListado[] = [
      {
        id: 3,
        titulo: '=SUMA(1,2)\n"oferta"',
        precio: 4.5,
        stock: 1,
        plataforma: 'PC',
        genero: 'RPG',
        disponible: true
      }
    ];

    servicio.exportarCSV(videojuegos);

    expect(crearUrl).toHaveBeenCalledOnce();
    expect(clic).toHaveBeenCalledOnce();
    if (!blobDescargado) {
      throw new Error('No se generó el archivo CSV.');
    }
    const bytes = await leerBlob(blobDescargado);
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
    const contenido = new TextDecoder().decode(bytes.slice(3));
    expect(contenido).toContain('"\'=SUMA(1,2)\n""oferta"""');
    expect(contenido).toContain('\r\n');

  });
});

function leerBlob(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result !== 'string') {
        reject(new Error('No se pudo leer el archivo de exportación.'));
        return;
      }
      const datosBase64 = lector.result.split(',')[1];
      if (!datosBase64) {
        reject(new Error('El archivo de exportación no contiene datos.'));
        return;
      }
      resolve(Uint8Array.from(atob(datosBase64), (caracter) => caracter.charCodeAt(0)));
    };
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(blob);
  });
}
