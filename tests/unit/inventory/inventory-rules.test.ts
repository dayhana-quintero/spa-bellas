import { describe, expect, it } from 'vitest';

import {
  getNextQuantityForMovement,
  isLowStock,
} from '../../../src/domain/inventory/inventory-rules';
import {
  createSupply,
  listSupplies,
  recordSupplyMovement,
} from '../../../src/domain/inventory/inventory-service';

describe('inventory rules', () => {
  it('flags low stock and calculates the next balance after valid movements', () => {
    const supply = {
      id: '123e4567-e89b-12d3-a456-426614174030',
      name: 'Aceite relajante',
      category: 'cosmeticos',
      unit: 'botellas',
      quantityAvailable: 3,
      minimumThreshold: 3,
      isActive: true,
    };

    expect(isLowStock(supply)).toBe(true);
    expect(getNextQuantityForMovement(supply.quantityAvailable, 'entrada', 5)).toBe(8);
    expect(getNextQuantityForMovement(supply.quantityAvailable, 'consumo', 2)).toBe(1);
    expect(getNextQuantityForMovement(supply.quantityAvailable, 'correccion', 4, true)).toBe(-1);
  });

  it('prevents negative stock unless there is an explicit exception', () => {
    const supply = {
      id: '123e4567-e89b-12d3-a456-426614174031',
      name: 'Tónico calmante',
      category: 'cosmeticos',
      unit: 'frascos',
      quantityAvailable: 2,
      minimumThreshold: 1,
      isActive: true,
    };

    expect(() => getNextQuantityForMovement(supply.quantityAvailable, 'consumo', 5)).toThrow(/negativo/i);
    expect(() => getNextQuantityForMovement(supply.quantityAvailable, 'consumo', 5, true)).not.toThrow();
  });

  it('creates a supply and records a movement with audit data', () => {
    const created = createSupply({
      name: 'Exfoliante herbal',
      category: 'cosmeticos',
      unit: 'botellas',
      quantityAvailable: 12,
      minimumThreshold: 4,
      isActive: true,
    });

    const movement = recordSupplyMovement({
      supplyId: created.id,
      type: 'entrada',
      quantity: 5,
      reason: 'Compra semanal',
      adminId: '123e4567-e89b-12d3-a456-426614174032',
    });

    expect(created.quantityAvailable).toBe(12);
    expect(movement.quantity).toBe(5);
    expect(movement.reason).toBe('Compra semanal');
    expect(listSupplies().some((item) => item.id === created.id)).toBe(true);
  });
});
