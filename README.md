# 🔬 UGC Avatar System v2.0 — Premium Dashboard

Un dashboard Next.js 16 + Tailwind v4 + Framer Motion diseñado específicamente para agencias y creadores de contenido que gestionan **Influencers de IA (Avatares UGC)**. Alimentado de forma segura y flexible mediante la API de **DeepSeek**.

Este sistema permite definir cerebros y configuraciones de ADN de avatares, planificar contenido editorial, generar copys bilingües y prompts de video multitoma listos para la plataforma **Flow de Gemini**, simular conversaciones de DMs para optimizar el embudo conversacional, y medir el engagement con APIs reales.

---

## 🛠️ Arquitectura Modular del Proyecto

Tras una completa refactorización, el proyecto pasó de ser un monolito desorganizado a una estructura robusta y mantenible:

- `/src/app/page.tsx`: Punto de entrada que actúa únicamente como orquestador del dashboard.
- `/src/components`: Componentes modulares y reutilizables para el layout (`Header`, `Footer`), sidebar (`AvatarSidebar`), pestañas específicas (`IdentityTab`, `SetupTab`, `PlannerTab`, `ChatTab`, `MetricsTab`) y modales (`CreateAvatarModal`, `ConfirmDialog`).
- `/src/hooks`: Lógica de estado y llamadas API desacopladas del renderizado (`useAvatars`, `usePostIdeas`, `useChatSimulation`, `useClipboard`).
- `/src/lib`: Utilidades de parsing, cifrado y validaciones (`utils.ts`), tipos y datos iniciales de los avatares (`db.ts`), e integraciones de DeepSeek robustas con timeout y reintentos exponencialmente espaciados (`deepseek.ts`).

---

## 🔐 Seguridad & BYO-Key (Bring Your Own Key)

El sistema opera bajo un modelo **BYO-Key**:
1. Cada usuario puede ingresar su propia API Key de DeepSeek en el panel superior.
2. Las claves se guardan en el navegador de manera **ofuscada (base64)** en localStorage para evitar lectura accidental en DevTools.
3. Se transmiten de forma segura a través del header estándar `Authorization: Bearer <key>` hacia las APIs locales de Next.js.
4. **Trial Fallback (Opcional):** El backend permite configurar una clave maestra en el servidor a través de `.env.local` con `DEEPSEEK_API_KEY` para dar acceso sin clave al cliente si así se desea.

---

## 🚀 Inicio Rápido

### 1. Variables de Entorno
Crea un archivo `.env.local` en la raíz (puedes basarte en `.env.example`):
```bash
DEEPSEEK_API_KEY=sk-tu-clave-maestra-opcional
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar en Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📸 Guías Adicionales
Revisa [Instagram.md](file:///Instagram.md) para conocer las pautas de optimización viral y consistencia del avatar principal del sistema: **Milena Reyes**.
