import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IngresosService } from '../../../../services/ingresos.service';
import {
  Ingreso,
  TipoIngreso,
  FiltroIngresos,
  OPCIONES_CATEGORIA,
  OPCIONES_METODO_PAGO,
  OPCIONES_ESTADO,
  OPCIONES_CUENTA_DESTINO,
} from '../../models/ingresos.model';

@Component({
  selector: 'app-ingresos-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
})
export class IngresosMovimientos implements OnInit {
  private ingresosService = inject(IngresosService);
  private router = inject(Router);

  ingresos = signal<Ingreso[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  filtroTipo = signal<TipoIngreso | ''>('');
  filtroDesde = signal<string>('');
  filtroHasta = signal<string>('');

  private categoriaLabels = new Map(OPCIONES_CATEGORIA.map((o) => [o.value, o.label]));
  private metodoPagoLabels = new Map(OPCIONES_METODO_PAGO.map((o) => [o.value, o.label]));
  private estadoLabels = new Map(OPCIONES_ESTADO.map((o) => [o.value, o.label]));
  private cuentaDestinoLabels = new Map(OPCIONES_CUENTA_DESTINO.map((o) => [o.value, o.label]));

  ingresosOrdenados = computed(() =>
    [...this.ingresos()].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )
  );

  totalMonto = computed(() =>
    this.ingresosOrdenados().reduce((acc, i) => acc + Number(i.monto), 0)
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const filtro: FiltroIngresos = {};
    if (this.filtroTipo()) filtro.tipo = this.filtroTipo() as TipoIngreso;
    if (this.filtroDesde()) filtro.desde = this.filtroDesde();
    if (this.filtroHasta()) filtro.hasta = this.filtroHasta();

    this.ingresosService.listar(filtro).subscribe({
      next: (res) => {
        this.ingresos.set(res.ingresos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los movimientos');
        this.cargando.set(false);
      },
    });
  }

  limpiarFiltros(): void {
    this.filtroTipo.set('');
    this.filtroDesde.set('');
    this.filtroHasta.set('');
    this.cargar();
  }

  tipoLabel(tipo: TipoIngreso): string {
    switch (tipo) {
      case 'SUELDO_FIJO': return 'Sueldo fijo';
      case 'SUELDO_EXTRA': return 'Ingreso extra';
      case 'SUELDO_VARIADO': return 'Ingreso variable';
    }
  }

  categoriaLabel(ingreso: Ingreso): string {
    return ingreso.categoria ? this.categoriaLabels.get(ingreso.categoria) ?? ingreso.categoria : '—';
  }

  metodoPagoLabel(ingreso: Ingreso): string {
    return this.metodoPagoLabels.get(ingreso.metodoPago) ?? ingreso.metodoPago;
  }

  estadoLabel(ingreso: Ingreso): string {
    return ingreso.estado ? this.estadoLabels.get(ingreso.estado) ?? ingreso.estado : 'Pagado';
  }

  cuentaDestinoLabel(ingreso: Ingreso): string {
    return this.cuentaDestinoLabels.get(ingreso.cuentaDestino) ?? ingreso.cuentaDestino;
  }

  descripcionLabel(ingreso: Ingreso): string {
    return ingreso.descripcion?.trim() || 'Sueldo fijo';
  }

  formatoMonto(monto: string | number): string {
    return `Q${Number(monto).toFixed(2)}`;
  }

  formatoFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-GT');
  }

  volver(): void {
    this.router.navigateByUrl('/dashboard');
  }
}