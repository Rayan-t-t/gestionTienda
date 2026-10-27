import { Injectable } from '@angular/core';
import { VideojuegoListado } from '../models/videojuego.model';

/**
 * Genera exportaciones CSV y PDF del conjunto visible de videojuegos.
 */
@Injectable({
  providedIn: 'root'
})
export class ExportacionService {
  /**
   * Descarga un CSV RFC 4180 con protección frente a fórmulas de hoja de cálculo.
   */
  exportarCSV(videojuegos: readonly VideojuegoListado[]): void {
    const filas: readonly (readonly unknown[])[] = [
      ['ID', 'Título', 'Precio', 'Stock', 'Plataforma', 'Género', 'Disponible'],
      ...videojuegos.map((videojuego) => [
        videojuego.id ?? '',
        videojuego.titulo,
        videojuego.precio,
        videojuego.stock,
        videojuego.plataforma,
        videojuego.genero,
        videojuego.disponible ? 'Sí' : 'No'
      ])
    ];
    const contenido = `\uFEFF${filas.map((fila) => fila.map((celda) => this.celdaCSV(celda)).join(',')).join('\r\n')}`;
    this.descargar(contenido, 'videojuegos.csv', 'text/csv;charset=utf-8');
  }

  /**
   * Genera un PDF con fecha, tabla y numeración de páginas.
   */
  async exportarPDF(videojuegos: readonly VideojuegoListado[]): Promise<void> {
    const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    const documento = new JsPDF();
    const fecha = new Date().toLocaleDateString('es-ES');
    documento.setFontSize(16);
    documento.text('Listado de videojuegos', 14, 16);
    documento.setFontSize(10);
    documento.text(`Fecha de exportación: ${fecha}`, 14, 23);

    autoTable(documento, {
      head: [['ID', 'Título', 'Precio', 'Stock', 'Plataforma', 'Género', 'Disponible']],
      body: videojuegos.map((videojuego) => [
        String(videojuego.id ?? ''),
        videojuego.titulo,
        `${videojuego.precio} €`,
        String(videojuego.stock),
        videojuego.plataforma,
        videojuego.genero,
        videojuego.disponible ? 'Sí' : 'No'
      ]),
      startY: 29,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [56, 128, 255] },
      alternateRowStyles: { fillColor: [244, 247, 252] }
    });
    const totalPaginas = documento.getNumberOfPages();
    for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
      documento.setPage(pagina);
      documento.setFontSize(9);
      documento.text(
        `Página ${pagina} de ${totalPaginas}`,
        documento.internal.pageSize.getWidth() - 14,
        documento.internal.pageSize.getHeight() - 8,
        { align: 'right' }
      );
    }
    documento.save('videojuegos.pdf');
  }

  private celdaCSV(valor: unknown): string {
    let texto = String(valor);
    if (/^[=+\-@]/.test(texto)) {
      texto = `'${texto}`;
    }
    return `"${texto.replace(/"/g, '""')}"`;
  }

  private descargar(contenido: string, nombre: string, tipo: string): void {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
