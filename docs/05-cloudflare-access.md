# 05 · Proteger el panel con Cloudflare Access

El panel web NO tiene login propio: muestra todas tus conversaciones a quien
abra la URL. En producción, **protégelo SIEMPRE con Cloudflare Access antes de
meter conversaciones reales.** Es un paso bloqueante.

## Por qué

El panel es una bandeja de entrada con datos de tus leads. Sin protección,
cualquiera con la URL los vería. Cloudflare Access pone una puerta de
autenticación por delante, gratis.

## Pasos (con dominio propio)

1. Ten tu dominio en Cloudflare (DNS gestionado por Cloudflare) y el panel
   accesible en, p. ej., `panel.tu-dominio.com`.
2. Entra en **Cloudflare Zero Trust → Access → Applications → Add an
   application → Self-hosted**.
3. **Application domain:** `panel.tu-dominio.com`.
4. Crea una **policy Allow**:
   - Action: **Allow**.
   - Include: **Emails** (tu email) o **Emails ending in** (tu dominio).
5. Identity provider: **Email One-Time PIN** (recomendado: cero configuración,
   sin OAuth de Google). Cloudflare envía un código de un solo uso al email
   autorizado.

## Alternativa con `*.easypanel.host`

Si usas el subdominio que da EasyPanel en vez de un dominio propio, protégelo con
**Basic Auth** (usuario/contraseña) desde EasyPanel.

## Verificar SIEMPRE

Abre el panel en una **ventana de incógnito** con un email **NO autorizado** y
confirma que **rechaza** el acceso. Si entra, la policy está mal.

> Siguiente paso: [06 · Deploy en Hostinger](06-deploy-hostinger.md).
