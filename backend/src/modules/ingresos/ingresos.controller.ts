import type { Request, Response } from "express";
import {
  crearIngreso,
  listarIngresos,
  obtenerIngresoPorId,
  actualizarIngreso,
  eliminarIngreso,
  IngresoError,
} from "./ingresos.service.js";

function manejarError(error: unknown, res: Response) {
  if (error instanceof IngresoError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Error interno del servidor" });
}

export async function crear(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const ingreso = await crearIngreso(userId, req.body);
    return res.status(201).json({
      message: "Ingreso guardado correctamente",
      ingreso,
    });
  } catch (error) {
    return manejarError(error, res);
  }
}

export async function listar(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { tipo, desde, hasta } = req.query;
    const ingresos = await listarIngresos(userId, {
      tipo: tipo as any,
      desde: desde as string | undefined,
      hasta: hasta as string | undefined,
    });
    return res.status(200).json({ ingresos });
  } catch (error) {
    return manejarError(error, res);
  }
}

export async function obtenerPorId(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const ingreso = await obtenerIngresoPorId(userId, req.params.id as string);
    return res.status(200).json({ ingreso });
  } catch (error) {
    return manejarError(error, res);
  }
}

export async function actualizar(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const ingreso = await actualizarIngreso(userId, req.params.id as string, req.body);
    return res.status(200).json({
      message: "Ingreso actualizado correctamente",
      ingreso,
    });
  } catch (error) {
    return manejarError(error, res);
  }
}

export async function eliminar(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    await eliminarIngreso(userId, req.params.id as string);
    return res.status(200).json({ message: "Ingreso eliminado correctamente" });
  } catch (error) {
    return manejarError(error, res);
  }
}