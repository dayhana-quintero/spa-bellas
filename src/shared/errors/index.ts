// Representa los estados de carga, éxito, vacío y error para cualquier vista o flujo de datos.
export type LoadingState<T> =
  | { status: 'loading'; data?: T; message?: string }
  | { status: 'success'; data: T }
  | { status: 'empty'; data?: T; message: string }
  | { status: 'error'; error: AppError };

// Error de dominio con código, estado HTTP y mensaje seguro para no filtrar datos sensibles.
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly safeMessage: string;
  public readonly cause?: unknown;

  constructor({
    code,
    statusCode,
    message,
    safeMessage,
    cause,
  }: {
    code: string;
    statusCode: number;
    message: string;
    safeMessage?: string;
    cause?: unknown;
  }) {
    super(safeMessage ?? message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.safeMessage = safeMessage ?? message;
    this.cause = cause;
  }

  // Serializa solo la parte segura del error para exponerla fuera del dominio.
  toJSON() {
    return {
      code: this.code,
      statusCode: this.statusCode,
      message: this.safeMessage,
    };
  }
}

// Crea un estado de carga para un flujo asincrónico o carga inicial.
export function createLoadingState<T>(message?: string): LoadingState<T> {
  return {
    status: 'loading',
    message,
  };
}

// Crea un estado vacío cuando no hay registros que mostrar.
export function createEmptyState<T>(message: string, data?: T): LoadingState<T> {
  return {
    status: 'empty',
    data,
    message,
  };
}

// Crea un estado exitoso con los datos ya validados.
export function createSuccessState<T>(data: T): LoadingState<T> {
  return {
    status: 'success',
    data,
  };
}

// Crea un estado de error con un AppError ya normalizado.
export function createErrorState<T>(error: AppError): LoadingState<T> {
  return {
    status: 'error',
    error,
  };
}

// Comprueba si el estado actual es de carga.
export function isLoadingState<T>(state: LoadingState<T>): boolean {
  return state.status === 'loading';
}

// Comprueba si el estado actual representa un vacio de resultados.
export function isEmptyState<T>(state: LoadingState<T>): boolean {
  return state.status === 'empty';
}

// Normaliza cualquier error desconocido a una instancia segura de AppError.
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError({
      code: 'INTERNAL',
      statusCode: 500,
      message: error.message,
      safeMessage: 'Ocurrió un error inesperado.',
      cause: error,
    });
  }

  return new AppError({
    code: 'INTERNAL',
    statusCode: 500,
    message: 'Unknown error',
    safeMessage: 'Ocurrió un error inesperado.',
    cause: error,
  });
}
