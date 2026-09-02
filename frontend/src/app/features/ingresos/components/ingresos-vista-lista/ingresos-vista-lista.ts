import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ingreso } from '../../models/ingreso.model';

@Component({
  selector: 'app-ingresos-vista-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingresos-vista-lista.html',
  styleUrl: './ingresos-vista-lista.css',
})
export class IngresosVistaLista {
  @Input() ingresos: Ingreso[] = [];

  etiqueta(ingreso: Ingreso): string {
    if (ingreso.tipo === 'SUELDO_FIJO') return 'Sueldo fijo';
    return ingreso.descripcion || 'Ingreso';
  }

  pagado(ingreso: Ingreso): boolean {
    return ingreso.tipo === 'SUELDO_FIJO' || ingreso.estado === 'PAGADO';
  }
}