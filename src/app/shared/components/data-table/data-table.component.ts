import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

/**
 * Define una columna visible de la tabla de datos.
 */
export interface ColumnaTabla {
  clave: string;
  etiqueta: string;
  ordenable?: boolean;
}

/**
 * Tabla genérica con búsqueda, ordenación y paginación en cliente.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T extends object> {
  readonly columnas = input.required<readonly ColumnaTabla[]>();
  readonly datos = input.required<readonly T[]>();
  readonly textoVacio = input('No hay datos para mostrar.');
  readonly cargando = input(false);
  readonly mostrarAcciones = input(false);
  readonly tamanoPagina = input(10);

  readonly filaSeleccionada = output<T>();
  readonly editar = output<T>();
  readonly eliminar = output<T>();
  readonly busquedaCambiada = output<string>();

  readonly busqueda = signal('');
  readonly pagina = signal(0);
  readonly columnaOrden = signal<string | null>(null);
  readonly ordenAscendente = signal(true);

  readonly datosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLocaleLowerCase();
    const filas = this.datos();
    if (!termino) {
      return filas;
    }

    return filas.filter((fila) =>
      this.columnas().some((columna) =>
        this.valorCelda(fila, columna.clave).toLocaleLowerCase().includes(termino)
      )
    );
  });

  readonly datosOrdenados = computed(() => {
    const columna = this.columnaOrden();
    if (!columna) {
      return this.datosFiltrados();
    }

    const direccion = this.ordenAscendente() ? 1 : -1;
    return [...this.datosFiltrados()].sort(
      (a, b) => this.comparar(Reflect.get(a, columna), Reflect.get(b, columna)) * direccion
    );
  });

  readonly paginasTotales = computed(() =>
    Math.max(1, Math.ceil(this.datosOrdenados().length / Math.max(1, this.tamanoPagina())))
  );

  readonly datosPagina = computed(() => {
    const tamano = Math.max(1, Math.floor(this.tamanoPagina()));
    const inicio = this.pagina() * tamano;
    return this.datosOrdenados().slice(inicio, inicio + tamano);
  });

  /**
   * Emite el texto de búsqueda y reinicia la paginación.
   */
  cambiarBusqueda(evento: Event): void {
    const elemento = evento.target;
    if (!(elemento instanceof HTMLInputElement)) {
      return;
    }
    this.busqueda.set(elemento.value);
    this.pagina.set(0);
    this.busquedaCambiada.emit(elemento.value);
  }

  /**
   * Ordena por la columna seleccionada alternando la dirección.
   */
  ordenar(columna: ColumnaTabla): void {
    if (!columna.ordenable) {
      return;
    }
    if (this.columnaOrden() === columna.clave) {
      this.ordenAscendente.update((ascendente) => !ascendente);
    } else {
      this.columnaOrden.set(columna.clave);
      this.ordenAscendente.set(true);
    }
    this.pagina.set(0);
  }

  /**
   * Avanza o retrocede una página de resultados.
   */
  cambiarPagina(delta: number): void {
    this.pagina.update((pagina) =>
      Math.min(this.paginasTotales() - 1, Math.max(0, pagina + delta))
    );
  }

  /**
   * Devuelve el valor de una celda como texto seguro.
   */
  valorCelda(fila: T, clave: string): string {
    const valor: unknown = Reflect.get(fila, clave);
    if (typeof valor === 'boolean') {
      return valor ? 'Sí' : 'No';
    }
    if (valor === null || valor === undefined || valor === '') {
      return '—';
    }
    return String(valor);
  }

  /**
   * Obtiene el identificador estable de una fila para el control flow.
   */
  identificador(fila: T): unknown {
    return Reflect.get(fila, 'id');
  }

  /**
   * Indica el estado accesible de ordenación de una columna.
   */
  estadoOrden(columna: ColumnaTabla): 'ascending' | 'descending' | 'none' {
    if (this.columnaOrden() !== columna.clave) {
      return 'none';
    }
    return this.ordenAscendente() ? 'ascending' : 'descending';
  }

  private comparar(a: unknown, b: unknown): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a ?? '').localeCompare(String(b ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  }
}
