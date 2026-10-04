import type { Supply } from '@/shared/types/supply';
import type { SupplyMovement } from '@/shared/types/supply-movement';

import {
  getNextQuantityForMovement,
  isLowStock,
} from '@/domain/inventory/inventory-rules';
import {
  listSuppliesFromSupabase,
  recordSupplyMovementToSupabase,
  saveSupplyToSupabase,
} from '@/lib/supabase-data';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  appendSupplyMovement,
  getSupplyById,
  listInventorySupplies,
  upsertSupply,
} from '@/storage/inventory/inventory-repository';

export function listSupplies() {
  return listInventorySupplies().map((supply) => ({
    ...supply,
    isLowStock: isLowStock(supply),
  }));
}

export async function listSuppliesForAdmin() {
  if (isSupabaseConfigured()) {
    const remoteSupplies = await listSuppliesFromSupabase();
    return remoteSupplies.map((supply) => ({
      ...supply,
      isLowStock: supply.quantityAvailable <= supply.minimumThreshold,
      movements: [],
    }));
  }

  return listSupplies();
}

export function createSupply(input: Omit<Supply, 'id'> & { id?: string }): Supply {
  validateSupply(input);
  return upsertSupply(normalizeSupply(input));
}

export async function saveSupplyForAdmin(input: Omit<Supply, 'id'> & { id?: string }): Promise<Supply> {
  validateSupply(input);
  const normalized = normalizeSupply(input);
  if (isSupabaseConfigured()) return saveSupplyToSupabase(normalized);
  return upsertSupply(normalized);
}

function normalizeSupply(input: Omit<Supply, 'id'> & { id?: string }) {
  return {
    ...input,
    name: input.name.trim(),
    category: input.category?.trim() || undefined,
    unit: input.unit.trim(),
  };
}

function validateSupply(input: Omit<Supply, 'id'> & { id?: string }) {
  if (input.name.trim().length < 2) throw new Error('El nombre del insumo debe tener al menos 2 caracteres.');
  if (!input.unit.trim()) throw new Error('La unidad del insumo es obligatoria.');
  if (!Number.isInteger(input.quantityAvailable) || input.quantityAvailable < 0) {
    throw new Error('La cantidad inicial debe ser un numero entero igual o mayor que cero.');
  }
  if (!Number.isInteger(input.minimumThreshold) || input.minimumThreshold < 0) {
    throw new Error('El umbral minimo debe ser un numero entero igual o mayor que cero.');
  }
}

export async function recordSupplyMovementForAdmin(input: {
  supplyId: string;
  type: SupplyMovement['type'];
  quantity: number;
  reason: string;
  adminId: string;
  allowsNegativeStock?: boolean;
}): Promise<SupplyMovement> {
  if (isSupabaseConfigured()) return recordSupplyMovementToSupabase(input);
  return recordSupplyMovement(input);
}

export function recordSupplyMovement(input: {
  supplyId: string;
  type: SupplyMovement['type'];
  quantity: number;
  reason: string;
  adminId: string;
  allowsNegativeStock?: boolean;
}): SupplyMovement {
  const supply = getSupplyById(input.supplyId);

  if (!supply) {
    throw new Error('No se encontro el insumo.');
  }

  if (input.reason.trim().length < 3) {
    throw new Error('Indica un motivo valido para el movimiento.');
  }

  getNextQuantityForMovement(
    supply.quantityAvailable,
    input.type,
    input.quantity,
    input.allowsNegativeStock,
  );

  return appendSupplyMovement({
    ...input,
    supplyId: supply.id,
    quantity: input.quantity,
    reason: input.reason.trim(),
    allowsNegativeStock: input.allowsNegativeStock,
  },
  );
}
