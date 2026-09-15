import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER: z
    .string()
    .regex(/^\d{10}$/, 'Debe ser un numero en formato internacional, solo digitos'),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Variables de entorno invalidas o faltantes:\n${issues}\n\nRevisa tu archivo .env.local contra .env.example`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();