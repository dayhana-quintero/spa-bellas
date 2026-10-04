import { getSupabaseAdminClient } from '@/lib/supabase';
import type { Supply } from '@/shared/types/supply';
import type { SupplyMovement } from '@/shared/types/supply-movement';
import { getNextQuantityForMovement } from '@/domain/inventory/inventory-rules';

export async function listAppointmentsFromSupabase(filters: { id?: string; status?: string; from?: string; to?: string; client?: string; service?: string } = {}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para consultar las citas.');
  }

  let query = supabase
    .from('appointments')
    .select(
      `
        id,
        client_id,
        service_id,
        status,
        scheduled_start,
        scheduled_end,
        notes,
        source,
        hold_expires_at,
        created_at,
        updated_at,
        clients:client_id (id, name, phone, email, whatsapp_consent),
        services:service_id (id, name, duration_minutes, price, is_active, is_bookable)
      `,
    )
    .order('scheduled_start', { ascending: false });

  if (filters.id) query = query.eq('id', filters.id);
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.from) {
    query = query.gte('scheduled_start', filters.from);
  }

  if (filters.to) {
    query = query.lte('scheduled_start', `${filters.to}T23:59:59.999Z`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase appointments fetch failed:', error.message);
    throw new Error('No se pudieron consultar las citas en Supabase.');
  }

  return (data ?? []).map((item) => {
    const clientRelation = item.clients as { id: string; name: string; phone: string | null; email: string | null; whatsapp_consent: boolean | null } | Array<{ id: string; name: string; phone: string | null; email: string | null; whatsapp_consent: boolean | null }> | null;
    const serviceRelation = item.services as { id: string; name: string; duration_minutes: number | null; is_active: boolean | null; is_bookable: boolean | null } | Array<{ id: string; name: string; duration_minutes: number | null; is_active: boolean | null; is_bookable: boolean | null }> | null;
    const client = Array.isArray(clientRelation) ? clientRelation[0] : clientRelation;
    const service = Array.isArray(serviceRelation) ? serviceRelation[0] : serviceRelation;

    return {
      id: item.id,
      clientId: item.client_id,
      serviceId: item.service_id,
      scheduledStart: new Date(item.scheduled_start),
      scheduledEnd: new Date(item.scheduled_end),
      status: item.status,
      notes: item.notes ?? undefined,
      source: item.source ?? 'publico',
      holdExpiresAt: item.hold_expires_at ? new Date(item.hold_expires_at) : undefined,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      client: client
        ? {
            id: client.id,
            name: client.name,
            phone: client.phone ?? '',
            whatsappConsent: Boolean(client.whatsapp_consent),
            notes: undefined,
            createdAt: new Date(),
          }
        : undefined,
      service: service
        ? {
            id: service.id,
            name: service.name,
            category: 'general',
            description: `${service.name}`,
            estimatedDuration: Number(service.duration_minutes ?? 60),
            isActive: Boolean(service.is_active ?? true),
            isBookable: Boolean(service.is_bookable ?? true),
          }
        : undefined,
    };
  }).filter((appointment) => {
    const clientName = appointment.client?.name?.toLowerCase() ?? '';
    const serviceName = appointment.service?.name?.toLowerCase() ?? '';
    return (!filters.client || clientName.includes(filters.client.toLowerCase())) &&
      (!filters.service || serviceName.includes(filters.service.toLowerCase()));
  });
}

export async function listAppointmentStatusHistoryFromSupabase(appointmentId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para consultar el historial.');

  const { data, error } = await supabase
    .from('appointment_status_history')
    .select('id, appointment_id, previous_status, new_status, changed_by_admin_id, note, changed_at')
    .eq('appointment_id', appointmentId)
    .order('changed_at', { ascending: true });

  if (error) {
    console.error('Supabase appointment history fetch failed:', error.message);
    throw new Error('No se pudo consultar el historial de la cita en Supabase.');
  }

  return (data ?? []).map((record) => ({
    id: record.id,
    appointmentId: record.appointment_id,
    previousStatus: record.previous_status,
    newStatus: record.new_status,
    changedByAdminId: record.changed_by_admin_id ?? '',
    changedAt: new Date(record.changed_at),
    note: record.note ?? undefined,
  }));
}

export async function updateAppointmentStatusInSupabase(input: {
  appointmentId: string;
  previousStatus: string;
  newStatus: string;
  adminId: string;
  note?: string;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para actualizar citas.');

  const { data: updatedAppointment, error: updateError } = await supabase
    .from('appointments')
    .update({ status: input.newStatus, updated_at: new Date().toISOString() })
    .eq('id', input.appointmentId)
    .eq('status', input.previousStatus)
    .select('id, status, updated_at')
    .maybeSingle();

  if (updateError || !updatedAppointment) {
    throw new Error('La cita cambió desde otra vista. Actualiza e intenta de nuevo.');
  }

  const { data: historyRecord, error: historyError } = await supabase
    .from('appointment_status_history')
    .insert({
      appointment_id: input.appointmentId,
      previous_status: input.previousStatus,
      new_status: input.newStatus,
      changed_by_admin_id: input.adminId,
      note: input.note ?? null,
    })
    .select('id')
    .single();

  if (historyError) {
    const { error: rollbackError } = await supabase
      .from('appointments')
      .update({ status: input.previousStatus })
      .eq('id', input.appointmentId)
      .eq('status', input.newStatus);
    if (rollbackError) console.error('Supabase appointment status rollback failed:', rollbackError.message);
    console.error('Supabase appointment history save failed:', historyError.message);
    throw new Error('No se pudo guardar el historial del cambio en Supabase.');
  }

  return {
    id: updatedAppointment.id,
    status: updatedAppointment.status,
    updatedAt: new Date(updatedAppointment.updated_at),
    historyId: historyRecord.id,
  };
}

export async function countActiveServicesFromSupabase() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para consultar servicios.');

  const { count, error } = await supabase
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) {
    console.error('Supabase services count failed:', error.message);
    throw new Error('No se pudo consultar el catálogo en Supabase.');
  }

  return count ?? 0;
}

export async function saveClientToSupabase(client: { id: string; name: string; phone: string; email?: string | null; notes?: string | null; whatsappConsent: boolean; createdAt?: Date | string }) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('clients')
    .upsert(
      {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email ?? null,
        notes: client.notes ?? null,
        whatsapp_consent: Boolean(client.whatsappConsent),
        created_at: client.createdAt ? new Date(client.createdAt).toISOString() : new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Supabase client sync failed:', error.message);
    return null;
  }

  return data;
}

export async function saveServiceToSupabase(service: {
  id: string;
  name: string;
  durationMinutes: number;
  isActive: boolean;
  isBookable: boolean;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('services')
    .upsert(
      {
        local_id: service.id,
        name: service.name,
        duration_minutes: service.durationMinutes,
        is_active: service.isActive,
        is_bookable: service.isBookable,
      },
      { onConflict: 'local_id' },
    )
    .select('id')
    .single();

  if (!error) {
    return data;
  }

  const needsLegacyLookup = error.message.toLowerCase().includes('local_id') || error.code === '42P10';
  if (!needsLegacyLookup) {
    console.error('Supabase service sync failed:', error.message);
    return null;
  }

  const { data: existingService, error: lookupError } = await supabase
    .from('services')
    .select('id')
    .eq('name', service.name)
    .eq('duration_minutes', service.durationMinutes)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    console.error('Supabase service lookup failed:', lookupError.message);
    return null;
  }

  const serviceValues = {
    name: service.name,
    duration_minutes: service.durationMinutes,
    is_active: service.isActive,
    is_bookable: service.isBookable,
  };

  const { data: syncedService, error: syncError } = existingService
    ? await supabase
        .from('services')
        .update(serviceValues)
        .eq('id', existingService.id)
        .select('id')
        .single()
    : await supabase
        .from('services')
        .insert(serviceValues)
        .select('id')
        .single();

  if (syncError) {
    console.error('Supabase service sync failed:', syncError.message);
    return null;
  }

  return syncedService;
}

export async function saveAppointmentToSupabase(appointment: {
  id: string;
  clientId: string;
  serviceId: string;
  scheduledStart: Date | string;
  scheduledEnd: Date | string;
  status: string;
  notes?: string | null;
  source?: string;
  holdExpiresAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('appointments')
    .upsert(
      {
        id: appointment.id,
        client_id: appointment.clientId,
        service_id: appointment.serviceId,
        scheduled_start: new Date(appointment.scheduledStart).toISOString(),
        scheduled_end: new Date(appointment.scheduledEnd).toISOString(),
        status: appointment.status,
        notes: appointment.notes ?? null,
        source: appointment.source ?? 'publico',
        hold_expires_at: appointment.holdExpiresAt ? new Date(appointment.holdExpiresAt).toISOString() : null,
        created_at: appointment.createdAt ? new Date(appointment.createdAt).toISOString() : new Date().toISOString(),
        updated_at: appointment.updatedAt ? new Date(appointment.updatedAt).toISOString() : new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('Supabase appointment sync failed:', error.message);
    return null;
  }

  return data;
}

export async function listSuppliesFromSupabase() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para consultar el inventario.');
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Supabase supplies fetch failed:', error.message);
    throw new Error('No se pudo consultar el inventario en Supabase.');
  }

  return (data ?? []).map((item): Supply & { isLowStock: boolean; movements: SupplyMovement[] } => ({
    id: item.id,
    name: item.name,
    category: item.category ?? undefined,
    unit: item.unit,
    quantityAvailable: Number(item.quantity_available ?? 0),
    minimumThreshold: Number(item.minimum_threshold ?? 0),
    isActive: Boolean(item.active ?? true),
    isLowStock: Number(item.quantity_available ?? 0) <= Number(item.minimum_threshold ?? 0),
    movements: [],
  }));
}

export async function saveSupplyToSupabase(input: Omit<Supply, 'id'> & { id?: string }) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para guardar insumos.');
  }

  const values = {
    name: input.name.trim(),
    category: input.category?.trim() || null,
    unit: input.unit.trim(),
    quantity_available: input.quantityAvailable,
    minimum_threshold: input.minimumThreshold,
    active: input.isActive,
  };

  const query = input.id
    ? supabase.from('inventory_items').upsert({ ...values, id: input.id }, { onConflict: 'id' })
    : supabase.from('inventory_items').insert(values);
  const { data, error } = await query.select('*').single();

  if (error) {
    console.error('Supabase supply save failed:', error.message);
    throw new Error('No se pudo guardar el insumo en Supabase. Verifica el esquema y vuelve a intentar.');
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category ?? undefined,
    unit: data.unit,
    quantityAvailable: Number(data.quantity_available),
    minimumThreshold: Number(data.minimum_threshold),
    isActive: Boolean(data.active),
  } satisfies Supply;
}

export async function recordSupplyMovementToSupabase(input: {
  supplyId: string;
  type: SupplyMovement['type'];
  quantity: number;
  reason: string;
  adminId: string;
  allowsNegativeStock?: boolean;
}) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para registrar movimientos.');
  }
  if (input.reason.trim().length < 3) {
    throw new Error('Indica un motivo valido para el movimiento.');
  }

  const { data: currentSupply, error: readError } = await supabase
    .from('inventory_items')
    .select('quantity_available')
    .eq('id', input.supplyId)
    .single();

  if (readError || !currentSupply) {
    throw new Error('No se encontro el insumo en Supabase.');
  }

  const currentQuantity = Number(currentSupply.quantity_available);
  const nextQuantity = getNextQuantityForMovement(
    currentQuantity,
    input.type,
    input.quantity,
    input.allowsNegativeStock,
  );
  const { data: updatedSupply, error: updateError } = await supabase
    .from('inventory_items')
    .update({ quantity_available: nextQuantity })
    .eq('id', input.supplyId)
    .eq('quantity_available', currentQuantity)
    .select('id')
    .maybeSingle();

  if (updateError || !updatedSupply) {
    throw new Error('El stock cambio durante el movimiento. Actualiza la lista y vuelve a intentarlo.');
  }

  const { data: movement, error: movementError } = await supabase
    .from('inventory_movements')
    .insert({
      inventory_item_id: input.supplyId,
      movement_type: input.type,
      quantity: input.quantity,
      reason: input.reason.trim(),
      admin_id: input.adminId,
      allows_negative_stock: Boolean(input.allowsNegativeStock),
    })
    .select('*')
    .single();

  if (movementError) {
    const { error: rollbackError } = await supabase
      .from('inventory_items')
      .update({ quantity_available: currentQuantity })
      .eq('id', input.supplyId)
      .eq('quantity_available', nextQuantity);
    if (rollbackError) console.error('Supabase inventory rollback failed:', rollbackError.message);
    console.error('Supabase movement save failed:', movementError.message);
    throw new Error('No se pudo guardar el movimiento en Supabase. El inventario se revirtio si no hubo otro cambio simultaneo.');
  }

  return {
    id: movement.id,
    supplyId: movement.inventory_item_id,
    type: movement.movement_type,
    quantity: Number(movement.quantity),
    reason: movement.reason,
    adminId: movement.admin_id,
    allowsNegativeStock: Boolean(movement.allows_negative_stock),
    createdAt: new Date(movement.created_at),
  } satisfies SupplyMovement;
}

export async function getAdminUserByCodeFromSupabase(code: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) {
    console.error('Supabase admin lookup failed:', error.message);
    return null;
  }

  return data;
}
