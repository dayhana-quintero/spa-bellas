import type { Supply } from '@/shared/types/supply';
import type { SupplyMovement } from '@/shared/types/supply-movement';

import { createId, readSpaData, withSpaData } from '@/storage/spa-store';

import { getNextQuantityForMovement } from '../../domain/inventory/inventory-rules';

export function clearInventory() {
  return withSpaData((data) => {
    data.supplies = [];
    data.supplyMovements = [];
    return true;
  });
}

export function listInventorySupplies() {
  const data = readSpaData();

  return data.supplies.map((supply) => ({
    ...supply,
    isLowStock: supply.quantityAvailable <= supply.minimumThreshold,
    movements: data.supplyMovements.filter((movement) => movement.supplyId === supply.id),
  }));
}

export function getSupplyById(supplyId: string) {
  return readSpaData().supplies.find((item) => item.id === supplyId) ?? null;
}

export function upsertSupply(input: Omit<Supply, 'id'> & { id?: string }): Supply {
  return withSpaData((data) => {
    const supply: Supply = { ...input, id: input.id ?? createId() };
    const index = data.supplies.findIndex((item) => item.id === supply.id);

    if (index >= 0) {
      data.supplies[index] = supply;
    } else {
      data.supplies.push(supply);
    }

    return supply;
  });
}

export function appendSupplyMovement(input: {
  supplyId: string;
  type: SupplyMovement['type'];
  quantity: number;
  reason: string;
  adminId: string;
  allowsNegativeStock?: boolean;
}): SupplyMovement {
  return withSpaData((data) => {
    const supply = data.supplies.find((item) => item.id === input.supplyId);

    if (!supply) {
      throw new Error('No se encontro el insumo.');
    }

    const nextQuantity = getNextQuantityForMovement(
      supply.quantityAvailable,
      input.type,
      input.quantity,
      input.allowsNegativeStock,
    );

    supply.quantityAvailable = nextQuantity;

    const movement: SupplyMovement = {
      id: createId(),
      supplyId: input.supplyId,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      adminId: input.adminId,
      createdAt: new Date(),
      allowsNegativeStock: input.allowsNegativeStock,
    };

    data.supplyMovements.push(movement);
    return movement;
  });
}
