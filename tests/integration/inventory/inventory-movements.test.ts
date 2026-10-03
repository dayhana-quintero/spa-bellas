import { describe, expect, it } from 'vitest';

import { createSupply, listSupplies, recordSupplyMovement } from '../../../src/domain/inventory/inventory-service';
import { clearInventory } from '../../../src/storage/inventory/inventory-repository';

describe('inventory movement flow', () => {
  it('persists supply updates and movement audit data', () => {
    clearInventory();

    const created = createSupply({
      name: 'Aceite calmante',
      category: 'cosmeticos',
      unit: 'botellas',
      quantityAvailable: 10,
      minimumThreshold: 2,
      isActive: true,
    });

    const movement = recordSupplyMovement({
      supplyId: created.id,
      type: 'entrada',
      quantity: 5,
      reason: 'Compra semanal',
      adminId: '123e4567-e89b-12d3-a456-426614174040',
    });

    const stored = listSupplies();
    const supply = stored.find((item) => item.id === created.id);

    expect(movement.type).toBe('entrada');
    expect(movement.reason).toBe('Compra semanal');
    expect(supply?.quantityAvailable).toBe(15);
    expect(supply?.movements).toHaveLength(1);
  });
});
