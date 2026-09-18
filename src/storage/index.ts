export type Repository<T extends { id: string }> = {
  getById: (id: string) => T | null;
  list: () => T[];
  save: (entity: T) => T;
  delete: (id: string) => void;
};

export class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  private store = new Map<string, T>();

  getById(id: string): T | null {
    return this.store.get(id) ?? null;
  }

  list(): T[] {
    return Array.from(this.store.values());
  }

  save(entity: T): T {
    this.store.set(entity.id, entity);
    return entity;
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  // Limpia todos los registros (útil para pruebas).
  clear(): void {
    this.store.clear();
  }
}

export type Persistable = {
  id: string;
};
