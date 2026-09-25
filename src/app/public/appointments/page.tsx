"use client";

import { useEffect, useMemo, useState } from "react";

import { createAppointmentRequest } from "../../../domain/appointments/create-appointment-request";
import { getAvailableSlotsForDate } from "../../../domain/availability/availability-service";
import { getPublicCatalog } from "../../../domain/services/public-catalog";

type DayKey = "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo";
const services = getPublicCatalog();
const baseAvailability = { spaCapacity: 1, bufferBetweenAppointments: 15, defaultHoldDuration: 30, workingDays: ["jueves"] as DayKey[], nonWorkingDays: [] as Date[], openingHours: { jueves: { opensAt: 9 * 60, closesAt: 17 * 60 } } as Partial<Record<DayKey, { opensAt: number; closesAt: number }>>, adminBlocks: [] as Array<{ startsAt: Date; endsAt: Date; reason?: string }> };

export default function PublicAppointmentsPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id ?? "");
  const [date, setDate] = useState("2026-09-24");
  const [selectedSlot, setSelectedSlot] = useState("10:30");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { if (!services.some((service) => service.id === selectedServiceId) && services[0]) setSelectedServiceId(services[0].id); }, [selectedServiceId]);
  const slots = useMemo(() => getAvailableSlotsForDate({ date, serviceDurationMinutes: 60, availability: baseAvailability, bookedAppointments: [], pendingHolds: [] }), [date]);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); try { const request = createAppointmentRequest({ serviceId: selectedServiceId, client: { id: "123e4567-e89b-12d3-a456-426614174001", name, phone, notes }, date, slot: selectedSlot, consent }); setMessage(`Solicitud pendiente para ${request.client.name} el ${request.date} a las ${request.slot}.`); } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo crear la solicitud."); } }
  return <main><h1>Solicitar cita</h1><section>{services.length === 0 ? <p>No hay servicios disponibles en este momento.</p> : services.map((service) => <button key={service.id} type="button" aria-label={service.name} onClick={() => setSelectedServiceId(service.id)}>{service.name}</button>)}</section>{services.length > 0 ? <form onSubmit={handleSubmit}><label>Fecha de la cita<input aria-label="Fecha de la cita" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><div>{slots.length > 0 ? slots.map((slot) => <button key={slot.time} type="button" aria-pressed={selectedSlot === slot.time} onClick={() => setSelectedSlot(slot.time)}>{slot.time}</button>) : <p>No hay horarios disponibles para esta fecha.</p>}</div><label>Nombre completo<input aria-label="Nombre completo" value={name} onChange={(event) => setName(event.target.value)} /></label><label>Telefono WhatsApp<input aria-label="Telefono WhatsApp" value={phone} onChange={(event) => setPhone(event.target.value)} /></label><label>Notas opcionales<textarea aria-label="Notas opcionales" value={notes} onChange={(event) => setNotes(event.target.value)} /></label><label><input aria-label="Acepto que el spa confirme por WhatsApp" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />Acepto que el spa confirme por WhatsApp</label><button type="submit">Enviar solicitud</button></form> : null}{message ? <p aria-live="polite" role="status">{message}</p> : null}</main>;
}
