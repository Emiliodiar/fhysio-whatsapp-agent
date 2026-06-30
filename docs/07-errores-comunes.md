# 07 · Errores comunes

Resumen práctico. Para el detalle técnico completo de cada caso, ver
`errores-sesion.md` en la raíz, y ejecuta siempre primero:

```
npm run doctor
```

## El bot no responde a los mensajes

- ¿Estás escribiendo desde **otro** teléfono? Los mensajes propios se ignoran.
- ¿La conversación está en **Modo Humano**? En ese modo la IA no responde.
- Puede ser el formato **`@lid`** (WhatsApp 2025+). El handler ya lo soporta;
  revisa que llegan filas a `messages` y mira `errores-sesion.md #5`.
- ¿API key válida y modelo correcto (no `:free`)? `npm run doctor` lo comprueba.

## No conecta / no sale el QR

- Abre `http://localhost:3000`; el QR aparece ahí.
- Códigos de Baileys: **405** (versión, ya mitigado), **440** (fingerprint /
  reconexión, ya mitigado con backoff), **515** (NO es error: pairing OK),
  **401** (sesión cerrada: re-escanea). Ver `errores-sesion.md` #1-#4.

## `npm install` falla (`ERR_INVALID_ARG_TYPE` / `reify` / `rollback`)

`node_modules` corrupto. Bórralo y reinstala. **No** toques las versiones del
`package.json`. (`errores-sesion.md #13`.)

## Windows: error compilando `better-sqlite3`

Instala **Visual Studio Build Tools** (C++) y `npm rebuild better-sqlite3`.
(`errores-sesion.md #9`.)

## El build (`next build`) falla con `database is locked`

La DB debe inicializarse de forma **perezosa** (ya lo hace `db.ts`). No abrir la
DB al importar. (`errores-sesion.md #6`.)

## Tras redeploy vuelve a pedir el QR

Faltan los **volúmenes persistentes** `/app/auth` y `/app/data` en EasyPanel.
(`errores-sesion.md #14`.)

## Respuestas con error 429

Estás usando un modelo `:free`. Cámbialo a `openai/gpt-4o-mini` u otro de pago.
(`errores-sesion.md #10`.)

> Siguiente paso: [08 · Coexistencia con WhatsApp](08-whatsapp-coexistence.md).
