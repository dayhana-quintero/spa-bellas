import { describe, expect, it } from 'vitest';

import {
  InMemoryRepository,
  type Repository,
} from '../../../src/storage';

describe('storage repositories', () => {
  it('stores and retrieves records by id', () => {
    const repo: Repository<{ id: string; name: string }> = new InMemoryRepository();

    repo.save({ id: '1', name: 'Ana' });
    repo.save({ id: '2', name: 'Luis' });

    expect(repo.getById('1')).toEqual({ id: '1', name: 'Ana' });
    expect(repo.list()).toHaveLength(2);
  });

  it('removes records and returns empty state when missing', () => {
    const repo: Repository<{ id: string; name: string }> = new InMemoryRepository();

    repo.save({ id: 'a', name: 'Cliente' });
    repo.delete('a');

    expect(repo.getById('a')).toBeNull();
    expect(repo.list()).toEqual([]);
  });
});
