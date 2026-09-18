export type ClientSeed = {
  id: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};

export type ServiceSeed = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

export type AppointmentSeed = {
  id: string;
  serviceId: string;
  clientId: string;
  date: string;
  startTime: string;
  status: "pendiente" | "confirmada" | "cancelada";
};

export const createClient = (overrides: Partial<ClientSeed> = {}): ClientSeed => ({
  id: "client-001",
  name: "Ana García",
  phone: "+52 555 123 4567",
  email: "ana.garcia@example.com",
  consent: true,
  ...overrides,
});

export const createService = (overrides: Partial<ServiceSeed> = {}): ServiceSeed => ({
  id: "service-001",
  name: "Masaje relajante",
  category: "Relajación",
  durationMinutes: 60,
  price: 850,
  active: true,
  ...overrides,
});

export const createAppointment = (
  overrides: Partial<AppointmentSeed> = {},
): AppointmentSeed => ({
  id: "appointment-001",
  serviceId: "service-001",
  clientId: "client-001",
  date: "2026-09-24",
  startTime: "10:30",
  status: "pendiente",
  ...overrides,
});

export const createAppointmentRequest = (overrides: Record<string, unknown> = {}) => ({
  serviceId: "service-001",
  client: createClient(),
  date: "2026-09-24",
  slot: "10:30",
  notes: "Necesito una sesión relajante.",
  consent: true,
  ...overrides,
});

export const createAvailabilitySlot = (overrides: Record<string, unknown> = {}) => ({
  serviceId: "service-001",
  date: "2026-09-24",
  time: "10:30",
  available: true,
  capacity: 1,
  ...overrides,
});

export const createViewport = (width: number, height: number) => ({ width, height });
