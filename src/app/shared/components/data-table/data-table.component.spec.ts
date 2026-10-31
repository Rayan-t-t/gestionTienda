import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent, ColumnaTabla } from './data-table.component';

interface FilaPrueba {
  id: number;
  titulo: string;
  precio: number;
}

describe('DataTableComponent', () => {
  let fixture: ComponentFixture<DataTableComponent<FilaPrueba>>;
  let componente: DataTableComponent<FilaPrueba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(DataTableComponent<FilaPrueba>);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('columnas', [
      { clave: 'titulo', etiqueta: 'Título', ordenable: true },
      { clave: 'precio', etiqueta: 'Precio', ordenable: true }
    ] satisfies ColumnaTabla[]);
    fixture.componentRef.setInput('datos', [
      { id: 1, titulo: 'Aventura', precio: 10 },
      { id: 2, titulo: 'Deportes', precio: 20 }
    ]);
    fixture.componentRef.setInput('mostrarAcciones', true);
    fixture.detectChanges();
  });

  it('emite búsqueda, selección de fila, edición y eliminación', () => {
    const busquedas: string[] = [];
    const filasSeleccionadas: FilaPrueba[] = [];
    const filasEditadas: FilaPrueba[] = [];
    const filasEliminadas: FilaPrueba[] = [];
    componente.busquedaCambiada.subscribe((valor) => busquedas.push(valor));
    componente.filaSeleccionada.subscribe((fila) => filasSeleccionadas.push(fila));
    componente.editar.subscribe((fila) => filasEditadas.push(fila));
    componente.eliminar.subscribe((fila) => filasEliminadas.push(fila));

    const buscador = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    buscador.value = 'aventura';
    buscador.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const fila = fixture.nativeElement.querySelector('tbody tr') as HTMLTableRowElement;
    fila.click();
    const botones = fixture.nativeElement.querySelectorAll('tbody button') as NodeListOf<HTMLButtonElement>;
    botones[0].click();
    botones[1].click();

    expect(busquedas).toEqual(['aventura']);
    expect(filasSeleccionadas.map((seleccionada) => seleccionada.id)).toEqual([1]);
    expect(filasEditadas.map((editada) => editada.id)).toEqual([1]);
    expect(filasEliminadas.map((eliminada) => eliminada.id)).toEqual([1]);
  });
});
