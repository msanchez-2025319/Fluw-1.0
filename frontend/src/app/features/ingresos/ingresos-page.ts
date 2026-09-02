import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, MeResponse } from '../../services/auth.service';
import { IngresosService } from '../../services/ingresos.service';
import { Ingreso } from './models/ingresos.model';
import { SueldoFijoModal } from './models/components/sueldo-fijo-modal/sueldo-fijo-modal';
import { IngresoExtraModal } from './models/components/ingreso-extra-modal/ingreso-extra-modal';
import {
  IngresosMenuModal,
  OpcionIngresoMenu,
} from './models/components/ingresos-menu-modal/ingresos-menu-modal';

@Component({
  selector: 'app-ingresos-page',
  standalone: true,
  imports: [
    CommonModule,
    SueldoFijoModal,
    IngresoExtraModal,
    IngresosMenuModal,
  ],
  templateUrl: './ingresos-page.html',
  styleUrl: './ingresos-page.css',
})
export class IngresosPage implements OnInit {
  private authService = inject(AuthService);
  private ingresosService = inject(IngresosService);
  private router = inject(Router);

  user = signal<MeResponse | null>(null);
  ingresos = signal<Ingreso[]>([]);
  cargando = signal(true);
  errorMensaje = signal<string | null>(null);

  totalSueldoFijo = computed(() =>
    this.ingresos()
      .filter((i) => i.tipo === 'SUELDO_FIJO')
      .reduce((acc, i) => acc + Number(i.monto), 0)
  );

  mostrarMenuModal = signal(false);
  mostrarSueldoFijoModal = signal(false);
  mostrarIngresoExtraModal = signal(false);
  tipoIngresoExtra = signal<'SUELDO_EXTRA' | 'SUELDO_VARIADO'>('SUELDO_EXTRA');

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.user.set(user);
        this.cargarIngresos();
      },
      error: () => this.router.navigateByUrl('/session-expired'),
    });
  }

  cargarIngresos(): void {
    this.cargando.set(true);
    this.errorMensaje.set(null);
    this.ingresosService.listar().subscribe({
      next: (res) => {
        this.ingresos.set(res.ingresos);
        this.cargando.set(false);
      },
      error: () => {
        this.errorMensaje.set('No se pudieron cargar los ingresos');
        this.cargando.set(false);
      },
    });
  }

  abrirSueldoFijo(): void {
    this.mostrarMenuModal.set(false);
    this.mostrarSueldoFijoModal.set(true);
  }

  abrirMenuIngresos(): void {
    this.mostrarMenuModal.set(true);
  }

  onMenuSeleccionar(opcion: OpcionIngresoMenu): void {
    this.mostrarMenuModal.set(false);
    this.tipoIngresoExtra.set(opcion);
    this.mostrarIngresoExtraModal.set(true);
  }

  onGuardarSueldoFijo(input: any): void {
    this.mostrarSueldoFijoModal.set(false);
    this.ingresosService.crear(input).subscribe({
      next: () => this.cargarIngresos(),
      error: (err) => {
        this.errorMensaje.set(err.error?.message || 'Error al guardar el ingreso');
      },
    });
  }

  onGuardarIngresoExtra(input: any): void {
    this.mostrarIngresoExtraModal.set(false);
    this.ingresosService.crear(input).subscribe({
      next: () => this.cargarIngresos(),
      error: (err) => {
        this.errorMensaje.set(err.error?.message || 'Error al guardar el ingreso');
      },
    });
  }

  eliminarIngreso(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este ingreso?')) return;
    this.ingresosService.eliminar(id).subscribe({
      next: () => this.cargarIngresos(),
      error: (err) => {
        this.errorMensaje.set(err.error?.message || 'Error al eliminar el ingreso');
      },
    });
  }

  cerrarModales(): void {
    this.mostrarMenuModal.set(false);
    this.mostrarSueldoFijoModal.set(false);
    this.mostrarIngresoExtraModal.set(false);
  }

  irAMovimientos(): void {
    this.router.navigateByUrl('/ingresos/movimientos');
  }

  irADashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }

  formatearMonto(monto: string | number): string {
    return `Q${Number(monto).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-GT');
  }
}
