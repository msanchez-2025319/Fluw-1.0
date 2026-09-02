import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, MeResponse } from '../../services/auth.service';
import { IngresosService } from '../../services/ingresos.service';
import { Ingreso, SueldoFijoInput, IngresoExtraInput } from '../ingresos/models/ingresos.model';
import { SueldoFijoModal } from '../ingresos/models/components/sueldo-fijo-modal/sueldo-fijo-modal';
import { IngresosMenuModal, OpcionIngresoMenu } from '../ingresos/models/components/ingresos-menu-modal/ingresos-menu-modal';
import { IngresoExtraModal } from '../ingresos/models/components/ingreso-extra-modal/ingreso-extra-modal';

const MAX_INGRESOS_VISTA = 3;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SueldoFijoModal, IngresosMenuModal, IngresoExtraModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private authService = inject(AuthService);
  private ingresosService = inject(IngresosService);
  private router = inject(Router);

  user = signal<MeResponse | null>(null);

  ingresos = signal<Ingreso[]>([]);
  cargandoIngresos = signal(true);
  errorIngresos = signal<string | null>(null);

  /** Los N más recientes, para la tarjeta compacta del dashboard. */
  ingresosVista = computed(() =>
    [...this.ingresos()]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, MAX_INGRESOS_VISTA)
  );

  // --- Estado de los modales de creación ---
  mostrarSueldoFijoModal = signal(false);
  mostrarIngresosMenuModal = signal(false);
  tipoIngresoExtra = signal<OpcionIngresoMenu | null>(null); // no-null => mostrar IngresoExtraModal

  guardando = signal(false);
  errorGuardar = signal<string | null>(null);

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (user) => this.user.set(user),
      error: () => this.router.navigateByUrl('/session-expired'),
    });

    this.cargarIngresos();
  }

  private cargarIngresos(): void {
    this.cargandoIngresos.set(true);
    this.ingresosService.listar().subscribe({
      next: (res) => {
        this.ingresos.set(res.ingresos);
        this.cargandoIngresos.set(false);
      },
      error: () => {
        this.errorIngresos.set('No se pudieron cargar los ingresos');
        this.cargandoIngresos.set(false);
      },
    });
  }

  /** true si el ingreso se considera pagado (para el icono check/cancel). */
  estaPagado(ingreso: Ingreso): boolean {
    return ingreso.tipo === 'SUELDO_FIJO' || ingreso.estado === 'PAGADO';
  }

  /** Descripción a mostrar: Sueldo fijo no tiene 'descripcion', así que armamos una. */
  descripcionIngreso(ingreso: Ingreso): string {
    return ingreso.descripcion?.trim() || 'Sueldo fijo';
  }

  formatoMonto(monto: string): string {
    return `Q${Number(monto).toFixed(2)}`;
  }

  irAMovimientos(): void {
    this.router.navigateByUrl('/ingresos/movimientos');
  }

  // ===================== Modales: abrir / cerrar =====================

  abrirSueldoFijoModal(): void {
    this.errorGuardar.set(null);
    this.mostrarSueldoFijoModal.set(true);
  }

  abrirIngresosMenuModal(): void {
    this.errorGuardar.set(null);
    this.mostrarIngresosMenuModal.set(true);
  }

  onSeleccionarTipoExtra(opcion: OpcionIngresoMenu): void {
    this.mostrarIngresosMenuModal.set(false);
    this.tipoIngresoExtra.set(opcion);
  }

  cerrarModales(): void {
    this.mostrarSueldoFijoModal.set(false);
    this.mostrarIngresosMenuModal.set(false);
    this.tipoIngresoExtra.set(null);
    this.errorGuardar.set(null);
  }

  // ===================== Modales: guardar =====================

  guardarSueldoFijo(input: SueldoFijoInput): void {
    this.guardando.set(true);
    this.ingresosService.crear(input).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModales();
        this.cargarIngresos();
      },
      error: () => {
        this.guardando.set(false);
        this.errorGuardar.set('No se pudo guardar el sueldo fijo. Intenta de nuevo.');
      },
    });
  }

  guardarIngresoExtra(input: IngresoExtraInput): void {
    this.guardando.set(true);
    this.ingresosService.crear(input).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModales();
        this.cargarIngresos();
      },
      error: () => {
        this.guardando.set(false);
        this.errorGuardar.set('No se pudo guardar el ingreso. Intenta de nuevo.');
      },
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}