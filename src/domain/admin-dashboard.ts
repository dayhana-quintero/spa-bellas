import { readSpaData } from '@/storage/spa-store';

export type AdminDashboardSummary = {
  pendingAppointments: number;
  confirmedAppointments: number;
  expiredAppointments: number;
  activeServices: number;
  lowStockItems: number;
  generatedAt: Date;
};

export type LowStockSupply = {
  id: string;
  name: string;
  quantityAvailable: number;
  minimumThreshold: number;
};

export function getLowStockSupplies(): LowStockSupply[] {
  const { supplies } = readSpaData();

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

export function getAdminDashboardSummary(): AdminDashboardSummary {
  const data = readSpaData();

  return {
    pendingAppointments: data.appointments.filter((appointment) => appointment.status === 'pendiente').length,
    confirmedAppointments: data.appointments.filter((appointment) => appointment.status === 'confirmada').length,
    expiredAppointments: data.appointments.filter((appointment) => appointment.status === 'vencida').length,
    activeServices: data.services.filter((service) => service.isActive).length,
    lowStockItems: getLowStockSupplies().length,
    generatedAt: new Date(),
  };
}
