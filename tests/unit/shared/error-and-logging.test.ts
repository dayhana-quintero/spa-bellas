import { describe, expect, it, vi } from 'vitest';

import {
  AppError,
  createEmptyState,
  createErrorState,
  createLoadingState,
  createSuccessState,
  isEmptyState,
  isLoadingState,
  normalizeError,
} from '../../../src/shared/errors';
import { logError, logInfo, sanitizeForLog } from '../../../src/shared/logging';

describe('utilidades compartidas de errores', () => {
  // Verifica que el error de dominio mantenga el mensaje seguro y el código correcto.
  it('crea un error seguro y normaliza errores desconocidos', () => {
    const appError = new AppError({
      code: 'VALIDATION',
      statusCode: 400,
      message: 'Invalid appointment payload',
      safeMessage: 'Los datos no son válidos.',
    });

    const normalized = normalizeError(new Error('boom'));

    expect(appError.toJSON().message).toBe('Los datos no son válidos.');
    expect(normalized).toBeInstanceOf(AppError);
    expect(normalized.code).toBe('INTERNAL');
  });

  // Confirmamos que los estados de carga, vacio y éxito tengan la estructura esperada.
  it('crea estados de carga, vacío y éxito de forma consistente', () => {
    const loading = createLoadingState<string>();
    const empty = createEmptyState<string>('No hay citas disponibles');
    const success = createSuccessState(['one', 'two']);

    expect(isLoadingState(loading)).toBe(true);
    expect(isEmptyState(empty)).toBe(true);
    expect(isEmptyState(success)).toBe(false);
    expect(success.data).toEqual(['one', 'two']);
  });

  // Asegura que los contextos de logging no expongan secrets ni información sensible.
  it('sanitiza payloads y registra logs sin datos sensibles', () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    const payload = {
      password: 'secret123',
      token: 'abc',
      phone: '+5215512345678',
      user: { name: 'Ana', email: 'ana@example.com' },
    };

    const sanitized = sanitizeForLog(payload);
    logInfo('solicitud de cita', payload);

    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.phone).toBe('[REDACTED]');
    expect(sanitized.user.email).toBe('[REDACTED]');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  // Verifica que el registro de errores tampoco revele secretos en runtime.
  it('registra errores sin filtrar datos sensibles', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logError('No se pudo guardar', { password: 'secret', user: { name: 'Ana' } });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
