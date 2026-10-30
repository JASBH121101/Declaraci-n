# Personal Experience QA

Auditoría automatizada especializada para experiencias web narrativas e interactivas. El perfil se separa de las pruebas de comercio electrónico de JB Collections y evalúa Declaraci-n sin modificar el sitio publicado.

## Qué comprueba

- Recorrido de bienvenida, decisión de música, las tres preguntas, pista, revelación, carta y las dos respuestas finales.
- Dos viewports: móvil de 390 × 844 y escritorio de 1365 × 900.
- Capturas completas de los estados, desbordamientos horizontales, errores de JavaScript y recursos propios que no cargan.
- Accesibilidad automatizable con Axe.
- Revisión visual y narrativa con Cloudflare Workers AI, cuando están configuradas las credenciales.

La auditoría bloquea solicitudes HTTP distintas de GET, HEAD y OPTIONS. No inicia la música, no abre enlaces externos, no envía mensajes ni modifica datos.

## Ejecutar localmente

Instalá las herramientas de navegador:

```bash
npm install --no-save --no-package-lock playwright@1.64.1 @axe-core/playwright@4.14.0
npx playwright install chromium
```

Ejecutá el recorrido de solo lectura:

```bash
EXPERIENCE_AUDIT_URL="https://jasbh121101.github.io/Declaraci-n/" node qa/personal-experience-qa.mjs
```

Para analizar las capturas con Workers AI:

```bash
QA_PROFILE="personal-experience" \
CLOUDFLARE_ACCOUNT_ID="TU_ACCOUNT_ID" \
CLOUDFLARE_API_TOKEN="TU_API_TOKEN" \
node qa/ai-visual-review.mjs
```

Los valores de ejemplo no deben guardarse en archivos versionados.

## Configuración en GitHub

En **Settings → Secrets and variables → Actions** del repositorio Declaraci-n:

- Crear la variable `CLOUDFLARE_ACCOUNT_ID`.
- Crear el secreto `CLOUDFLARE_API_TOKEN` con permisos para ejecutar Workers AI.

Los secretos no se copian entre repositorios automáticamente. Si faltan, el auditor genera evidencia de navegador y deja las dimensiones que requieren IA como pendientes, sin inventar una puntuación.

## Ejecutar desde GitHub

1. Abrir **Actions → Personal Experience QA**.
2. Pulsar **Run workflow** en la rama `main`.
3. Activar `Run the read-only browser audit against the published Declaraci-n experience`.
4. Descargar el artefacto `personal-experience-qa-evidence`.

El informe global es la media aritmética de cinco dimensiones y solo aparece cuando hay evidencia completa: funcionamiento, diseño visual, experiencia narrativa, adaptabilidad y accesibilidad. No predice la respuesta emocional de la persona destinataria ni sustituye la revisión humana.
