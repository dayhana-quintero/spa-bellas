import { listSuppliesForAdmin } from '@/domain/inventory/inventory-service';
import { listAppointmentsForAdmin, listServices } from '@/domain/spa-service';
import { readSpaData } from '@/storage/spa-store';

export type AdminDashboardSummary = {
  pendingAppointments: number;
  confirmedAppointments: number;
  expiredAppointments: number;
  activeServices: number;
  lowStockItems: number;
  lowStockSupplies: LowStockSupply[];
  generatedAt: Date;
};

export type LowStockSupply = {
  id: string;
  name: string;
  quantityAvailable: number;
  minimumThreshold: number;
};

type StockSupply = {
  id: string;
  name: string;
  quantityAvailable: number;
  minimumThreshold: number;
  isActive: boolean;
};

// Prioriza primero el insumo mas urgentemente bajo de stock.
export function pickLowStockSupplies(supplies: StockSupply[]): LowStockSupply[] {
  return supplies
    .filter((supply) => supply.isActive && supply.quantityAvailable <= supply.minimumThreshold)
    .map((supply) => ({
      id: supply.id,
      name: supply.name,
      quantityAvailable: supply.quantityAvailable,
      minimumThreshold: supply.minimumThreshold,
    }))
    .sort((left, right) => left.quantityAvailable - right.quantityAvailable);
}

// Limites del dia calendario local: [hoy 00:00, manana 00:00).
export function getLocalDayBounds(now = new Date()): { start: Date; end: Date } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

// Citas del dia calendario local, ordenadas de la mas temprana a la mas tardia.
export function filterAppointmentsForLocalDay<T extends { scheduledStart: Date }>(
  appointments: T[],
  now = new Date(),
): T[] {
  const { start, end } = getLocalDayBounds(now);

  return appointments
    .filter((appointment) => appointment.scheduledStart >= start && appointment.scheduledStart < end)
    .sort((left, right) => left.scheduledStart.getTime() - right.scheduledStart.getTime());
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  // Si Supabase no esta disponible (o aun no hay datos remotos), el resumen
  // degrada al almacenamiento local para no dejar el panel vacio.
  const local = readSpaData();
  const [appointments, services, supplies] = await Promise.all([
    listAppointmentsForAdmin().catch(() => local.appointments),
    listServices().catch(() => local.services),
    listSuppliesForAdmin().catch(() => local.supplies),
  ]);
  const lowStockSupplies = pickLowStockSupplies(supplies);

  return {
    pendingAppointments: appointments.filter((appointment) => appointment.status === 'pendiente').length,
    confirmedAppointments: appointments.filter((appointment) => appointment.status === 'confirmada').length,
    expiredAppointments: appointments.filter((appointment) => appointment.status === 'vencida').length,
    activeServices: services.filter((service) => service.isActive).length,
    lowStockItems: lowStockSupplies.length,
    lowStockSupplies,
    generatedAt: new Date(),
  };
}
