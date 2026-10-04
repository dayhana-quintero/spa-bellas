import { getSupabaseClient } from '@/lib/supabase';

export async function listAppointmentsFromSupabase(filters: { status?: string; from?: string; to?: string; client?: string; service?: string } = {}) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
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
    return [];
  }

  return (data ?? []).map((item) => {
    const client = Array.isArray((item as any).clients) ? (item as any).clients[0] : (item as any).clients;
    const service = Array.isArray((item as any).services) ? (item as any).services[0] : (item as any).services;

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
  });
}

export async function saveClientToSupabase(client: { id: string; name: string; phone: string; email?: string | null; notes?: string | null; whatsappConsent: boolean; createdAt?: Date | string }) {
  const supabase = getSupabaseClient();

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
  const supabase = getSupabaseClient();

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
  const supabase = getSupabaseClient();

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
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Supabase supplies fetch failed:', error.message);
    return [];
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category ?? undefined,
    unit: item.unit,
    quantityAvailable: Number(item.quantity_available ?? 0),
    minimumThreshold: Number(item.minimum_threshold ?? 0),
    isActive: Boolean(item.active ?? true),
  }));
}

export async function getAdminUserByCodeFromSupabase(code: string) {
  const supabase = getSupabaseClient();

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
