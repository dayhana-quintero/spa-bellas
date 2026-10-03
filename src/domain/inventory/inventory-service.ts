import type { Supply } from '@/shared/types/supply';
import type { SupplyMovement } from '@/shared/types/supply-movement';

import {
  getNextQuantityForMovement,
  isLowStock,
} from '@/domain/inventory/inventory-rules';
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

export function createSupply(input: Omit<Supply, 'id'> & { id?: string }): Supply {
  if (input.quantityAvailable < 0) {
    throw new Error('La cantidad inicial no puede ser negativa.');
  }

  if (input.minimumThreshold < 0) {
    throw new Error('El umbral minimo no puede ser negativo.');
  }

  return upsertSupply(input);
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

  const nextQuantity = getNextQuantityForMovement(
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
