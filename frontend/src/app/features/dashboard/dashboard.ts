import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, MeResponse } from '../../services/auth.service';
import { IngresosService } from '../../services/ingresos.service';
import { Ingreso, IngresoInput, SueldoFijoInput, IngresoExtraInput } from '../ingresos/models/ingreso.model';

import { SueldoFijoModal } from '../ingresos/components/sueldo-fijo-modal/sueldo-fijo-modal';
import { IngresosMenuModal, OpcionIngresoMenu } from '../ingresos/components/ingresos-menu-modal/ingresos-menu-modal';
import { IngresoExtraModal } from '../ingresos/components/ingreso-extra-modal/ingreso-extra-modal';
import { IngresoEditarModal } from '../ingresos/components/ingreso-editar-modal/ingreso-editar-modal';
import { IngresosVistaLista } from '../ingresos/components/ingresos-vista-lista/ingresos-vista-lista';
import { IngresosTablaModal } from '../ingresos/components/ingresos-tabla-modal/ingresos-tabla-modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SueldoFijoModal,
    IngresosMenuModal,
    IngresoExtraModal,
    IngresoEditarModal,
    IngresosVistaLista,
    IngresosTablaModal,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private authService = inject(AuthService);
  private ingresosService = inject(IngresosService);
  private router = inject(Router);

  user = signal<MeResponse | null>(null);
  ingresos = signal<Ingreso[]>([]);

  ultimosIngresos = computed(() => this.ingresos().slice(0, 5));

  mostrarSueldoFijo = signal(false);
  mostrarIngresosMenu = signal(false);
  mostrarIngresoExtra = signal(false);
  tipoIngresoExtra = signal<'SUELDO_EXTRA' | 'SUELDO_VARIADO'>('SUELDO_EXTRA');
  mostrarTablaCompleta = signal(false);
  mostrarEditar = signal(false);
  idParaEditar = signal<string | null>(null);

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (user: MeResponse) => this.user.set(user),
      error: () => this.router.navigateByUrl('/session-expired'),
    });
    this.cargarIngresos();
  }

  cargarIngresos(): void {
    this.ingresosService.listar().subscribe({
      next: (res: { ingresos: Ingreso[] }) => this.ingresos.set(res.ingresos),
      error: (err: HttpErrorResponse) => console.error('Error al cargar ingresos', err),
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }

  // --- Sueldo fijo ---
  abrirSueldoFijo(): void { this.mostrarSueldoFijo.set(true); }
  cerrarSueldoFijo(): void { this.mostrarSueldoFijo.set(false); }

  guardarSueldoFijo(input: SueldoFijoInput): void {
    this.ingresosService.crear(input).subscribe({
      next: () => {
        this.cargarIngresos();
        this.mostrarSueldoFijo.set(false);
      },
      error: (err: HttpErrorResponse) => console.error('Error al guardar sueldo fijo', err),
    });
  }

  // --- Menú Ingresos (extras / variables) ---
  abrirIngresosMenu(): void { this.mostrarIngresosMenu.set(true); }
  cerrarIngresosMenu(): void { this.mostrarIngresosMenu.set(false); }

  onSeleccionarTipoExtra(opcion: OpcionIngresoMenu): void {
    this.tipoIngresoExtra.set(opcion);
    this.mostrarIngresosMenu.set(false);
    this.mostrarIngresoExtra.set(true);
  }

  cerrarIngresoExtra(): void { this.mostrarIngresoExtra.set(false); }

  guardarIngresoExtra(input: IngresoExtraInput): void {
    this.ingresosService.crear(input).subscribe({
      next: () => {
        this.cargarIngresos();
        this.mostrarIngresoExtra.set(false);
      },
      error: (err: HttpErrorResponse) => console.error('Error al guardar ingreso extra', err),
    });
  }

  // --- Tabla completa ---
  abrirTablaCompleta(): void { this.mostrarTablaCompleta.set(true); }
  cerrarTablaCompleta(): void { this.mostrarTablaCompleta.set(false); }

  abrirEditarDesdeTabla(id: string): void {
    this.idParaEditar.set(id);
    this.mostrarTablaCompleta.set(false);
    this.mostrarEditar.set(true);
  }

  // --- Editar / eliminar ---
  cerrarEditar(): void {
    this.mostrarEditar.set(false);
    this.idParaEditar.set(null);
  }

  onIngresoActualizado(): void {
    this.cargarIngresos();
    this.cerrarEditar();
  }

  onIngresoEliminado(): void {
    this.cargarIngresos();
    this.cerrarEditar();
  }
}