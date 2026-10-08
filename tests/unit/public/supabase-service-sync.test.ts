import { beforeEach, describe, expect, it, vi } from 'vitest';

const { supabaseMock, upsertQuery, lookupQuery, insertQuery } = vi.hoisted(() => {
  const upsertQuery = {
    upsert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
  };
  const lookupQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const insertQuery = {
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
  };
  const supabaseMock = {
    from: vi.fn(),
  };

  return { supabaseMock, upsertQuery, lookupQuery, insertQuery };
});

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdminClient: () => supabaseMock,
}));

import { saveServiceToSupabase } from '@/lib/supabase-data';

describe('Supabase service sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertQuery.upsert.mockReturnValue(upsertQuery);
    upsertQuery.select.mockReturnValue(upsertQuery);
    upsertQuery.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST204', message: "Could not find the 'local_id' column of 'services' in the schema cache" },
    });
    lookupQuery.select.mockReturnValue(lookupQuery);
    lookupQuery.eq.mockReturnValue(lookupQuery);
    lookupQuery.limit.mockReturnValue(lookupQuery);
    lookupQuery.maybeSingle.mockResolvedValue({ data: null, error: null });
    insertQuery.insert.mockReturnValue(insertQuery);
    insertQuery.select.mockReturnValue(insertQuery);
    insertQuery.single.mockResolvedValue({
      data: { id: '33333333-3333-4333-8333-333333333333' },
      error: null,
    });
    supabaseMock.from
      .mockReturnValueOnce(upsertQuery)
      .mockReturnValueOnce(lookupQuery)
      .mockReturnValueOnce(insertQuery);
  });

  it('fails with an actionable migration error when the deployed schema has no local_id column', async () => {
    await expect(
      saveServiceToSupabase({
        id: 'service-1',
        name: 'Masaje relajante',
        durationMinutes: 60,
        isActive: true,
        isBookable: true,
      }),
    ).rejects.toThrow('Aplica la migración remota');

    expect(upsertQuery.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'service-1',
        name: 'Masaje relajante',
        duration_minutes: 60,
        is_active: true,
        is_bookable: true,
      }),
      { onConflict: 'id' },
    );
    expect(lookupQuery.eq).not.toHaveBeenCalled();
    expect(insertQuery.insert).not.toHaveBeenCalled();
  });
});
