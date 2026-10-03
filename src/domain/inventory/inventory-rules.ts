import type { Supply } from '@/shared/types/supply';
import type { SupplyMovement } from '@/shared/types/supply-movement';

export function isLowStock(supply: Pick<Supply, 'quantityAvailable' | 'minimumThreshold'>): boolean {
  return supply.quantityAvailable <= supply.minimumThreshold;
}

export function getNextQuantityForMovement(
  currentQuantity: number,
  type: SupplyMovement['type'],
  quantity: number,
  allowsNegativeStock = false,
): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('La cantidad del movimiento debe ser positiva.');
  }

  const direction = type === 'entrada' ? 1 : -1;
  const nextQuantity = currentQuantity + direction * quantity;

  if (nextQuantity < 0 && !allowsNegativeStock) {
    throw new Error('El stock no puede quedar en negativo sin una excepcion explicita.');
  }

  return nextQuantity;
}
