import { beforeEach, describe, expect, it, vi } from 'vitest';

const { supabaseMock, saveQuery, readQuery, updateQuery, movementQuery } = vi.hoisted(() => {
  const saveQuery = { insert: vi.fn(), upsert: vi.fn(), select: vi.fn(), single: vi.fn() };
  const readQuery = { select: vi.fn(), eq: vi.fn(), single: vi.fn() };
  const updateQuery = { update: vi.fn(), eq: vi.fn(), select: vi.fn(), maybeSingle: vi.fn() };
  const movementQuery = { insert: vi.fn(), select: vi.fn(), single: vi.fn() };
  const supabaseMock = { from: vi.fn() };
  return { supabaseMock, saveQuery, readQuery, updateQuery, movementQuery };
});

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: () => supabaseMock,
}));

import { recordSupplyMovementToSupabase, saveSupplyToSupabase } from '@/lib/supabase-data';

const supplyRow = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  name: 'Aceite',
  category: 'Cosméticos',
  unit: 'botellas',
  quantity_available: 4,
  minimum_threshold: 2,
  active: true,
};

describe('Supabase inventory persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveQuery.insert.mockReturnValue(saveQuery);
    saveQuery.upsert.mockReturnValue(saveQuery);
    saveQuery.select.mockReturnValue(saveQuery);
    saveQuery.single.mockResolvedValue({ data: supplyRow, error: null });
    readQuery.select.mockReturnValue(readQuery);
    readQuery.eq.mockReturnValue(readQuery);
    readQuery.single.mockResolvedValue({ data: { quantity_available: 4 }, error: null });
    updateQuery.update.mockReturnValue(updateQuery);
    updateQuery.eq.mockReturnValue(updateQuery);
    updateQuery.select.mockReturnValue(updateQuery);
    updateQuery.maybeSingle.mockResolvedValue({ data: { id: supplyRow.id }, error: null });
    movementQuery.insert.mockReturnValue(movementQuery);
    movementQuery.select.mockReturnValue(movementQuery);
    movementQuery.single.mockResolvedValue({
      data: {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        inventory_item_id: supplyRow.id,
        movement_type: 'entrada',
        quantity: 2,
        reason: 'Compra semanal',
        admin_id: 'admin-1',
        allows_negative_stock: false,
        created_at: '2026-10-03T12:00:00.000Z',
      },
      error: null,
    });
  });

  it('inserts a supply with the database column names and returns its row', async () => {
    supabaseMock.from.mockReturnValue(saveQuery);

    const result = await saveSupplyToSupabase({
      name: 'Aceite',
      category: 'Cosméticos',
      unit: 'botellas',
      quantityAvailable: 4,
      minimumThreshold: 2,
      isActive: true,
    });

    expect(supabaseMock.from).toHaveBeenCalledWith('inventory_items');
    expect(saveQuery.insert).toHaveBeenCalledWith({
      name: 'Aceite',
      category: 'Cosméticos',
      unit: 'botellas',
      quantity_available: 4,
      minimum_threshold: 2,
      active: true,
    });
    expect(result).toEqual({
      id: supplyRow.id,
      name: 'Aceite',
      category: 'Cosméticos',
      unit: 'botellas',
      quantityAvailable: 4,
      minimumThreshold: 2,
      isActive: true,
    });
  });

  it('updates stock and stores its movement in Supabase', async () => {
    supabaseMock.from
      .mockReturnValueOnce(readQuery)
      .mockReturnValueOnce(updateQuery)
      .mockReturnValueOnce(movementQuery);

    const result = await recordSupplyMovementToSupabase({
      supplyId: supplyRow.id,
      type: 'entrada',
      quantity: 2,
      reason: 'Compra semanal',
      adminId: 'admin-1',
    });

    expect(updateQuery.update).toHaveBeenCalledWith({ quantity_available: 6 });
    expect(movementQuery.insert).toHaveBeenCalledWith({
      inventory_item_id: supplyRow.id,
      movement_type: 'entrada',
      quantity: 2,
      reason: 'Compra semanal',
      admin_id: 'admin-1',
      allows_negative_stock: false,
    });
    expect(result.supplyId).toBe(supplyRow.id);
    expect(result.type).toBe('entrada');
  });
});
