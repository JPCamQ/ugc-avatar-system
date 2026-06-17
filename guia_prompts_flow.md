# Guía Técnica: Estructura de Prompts para Flow de Gemini

Este documento contiene las plantillas maestras y la estructura genérica que genera el sistema para cada tipo de contenido en la plataforma **Flow de Gemini**. Los placeholders indicados entre `<...>` se rellenan automáticamente según los datos de la base de datos viva o la planificación de la IA.

---

## 1. Prompt Maestro de Retrato de ADN (Fijación Base)

* **Propósito:** Estabilizar y memorizar los rasgos faciales y la textura del avatar la primera vez que se genera. Actúa como el "molde" inicial.
* **Ubicación:** Fondo gris de estudio, luz natural y sin maquillaje para que sea la base definitiva.

```text
HIGH-FIDELITY CHARACTER DNA: Master. [<DESCRIPCIÓN_FÍSICA_DEL_AVATAR_EN_INGLÉS>]

DYNAMIC SCENE: [Standing indoors against a completely plain, flat, neutral light grey studio background. Even, soft natural light coming from a side window, casting subtle realistic shadows that define <her/his> facial structure and jawline.]

AUTHENTIC CREATOR: Shot on iPhone 17 Pro Max, wide angle lens, natural light only, no flash. Slightly overexposed. Real skin texture with natural inconsistencies — uneven tone, real pores, slight shine from heat. Hair not perfectly styled – a few strands out of place. Framing slightly imperfect, subject not perfectly centered. The image looks like a raw, unedited front-facing camera snapshot <she/he> posted to <her/his> Instagram stories. No studio lighting. No cinematic look. No color science adjustments.

Negative prompt constraints: <NEGATIVOS_OPCIONALES_COMO_FRECKLES_O_MOLES_SI_APLICA>bokeh, blurred background, golden hour, cinematic lighting, soft diffusion, studio lighting, color grading, beauty filter, perfect symmetry, airbrushed skin, plastic skin, 8K, hyper-detailed, Sony camera aesthetic, magazine quality, luxury campaign feel, soft studio light, gradient background, professional portrait photography setup.
```

---

## 2. Prompt de Escena Dinámica Individual (IMAGE)

* **Propósito:** Generar una publicación individual (UGC/lifestyle) del avatar en un escenario, vestuario y acción concretos.

```text
HIGH-FIDELITY CHARACTER DNA: Master. [<DESCRIPCIÓN_FÍSICA_DEL_AVATAR_EN_INGLÉS>]

MAKEUP PROTOCOL — Context-adaptive:
LEVEL 1 / GYM & SPORT: No makeup. Natural face, slight sweat shine, real skin only.
LEVEL 2 / CASUAL & LIFESTYLE: Minimal makeup — subtle brow definition, light tinted moisturizer, clear lip balm. Looks effortless, not done up.
LEVEL 3 / GOING OUT & SOCIAL: Natural glam — defined brows, light foundation, soft contour, nude or berry lip, subtle mascara. Polished but not overdone.
LEVEL 4 / FORMAL & EVENTS: Polished glam — flawless base, soft sculpted contour, defined brows, nude-rose or soft berry lip — NEVER dark red or gothic tones. Defined lashes. Looks powerful but still recognizably the character.
Apply the makeup level that matches the scene context automatically. Never leave face bare in formal or social contexts.

DYNAMIC SCENE: [A detailed description of the avatar wearing a specific outfit, acting naturally in a specific location (e.g. Wynwood streets, Miami cafes), shot with a raw mobile phone camera style.]

MAKEUP LEVEL TO APPLY: [<LEVEL_REQUERIDO_EJ_LEVEL_2>]

AUTHENTIC CREATOR: Shot on iPhone 17 Pro Max, wide angle lens, natural light only, no flash. Slightly overexposed. Real skin texture with natural inconsistencies — uneven tone, Soft makeup, nothing exaggerated, real pores, slight shine from heat and sun. Hair not perfectly styled — a few strands out of place. Expression relaxed, not composed for a camera. Framing slightly imperfect, subject not perfectly centered. The image looks like something posted to Instagram stories without editing. No studio lighting. No cinematic look. No color science adjustments.

REPEATING INGREDIENTS: [<OBJETOS_QUE_REPITEN_SI_APLICA_SINO_NONE>]

PRODUCT REFERENCE: [<DESCRIPCIÓN_DEL_PRODUCTO_PATROCINADO_SI_APLICA_SINO_NONE>]
```

---

## 3. Prompt de Carrusel (CAROUSEL)

* **Propósito:** Crear una secuencia de 5 a 7 fotos para una misma publicación en carrusel.
* **Regla Clave:** La `DYNAMIC SCENE` se descompone en tomas individuales que mantienen idéntico el vestuario y la iluminación, cambiando solo los planos y las poses para asegurar que el rostro no varíe de una foto a otra.

```text
HIGH-FIDELITY CHARACTER DNA: Master. [<DESCRIPCIÓN_FÍSICA_DEL_AVATAR_EN_INGLÉS>]

[...MISMO ENCABEZADO DE PROTOCOLO DE MAQUILLAJE...]

DYNAMIC SCENE: [
PHOTO 1: [A detailed description of the avatar wearing <OUTFIT_DETALLADO> in <LOCACIÓN> with <ILUMINACIÓN_Y_HAIRSTYLE>.]
PHOTO 2: [Repeat the exact same outfit, hairstyle, lighting, and location details as PHOTO 1, but changing only the camera scale (e.g., close-up shot) and the physical pose/expression.]
PHOTO 3: [Repeat the exact same details, but in a medium-wide shot walking towards the camera.]
PHOTO 4: [Repeat the exact same details, but showing a side angle detail.]
PHOTO 5: [Repeat the exact same details, but looking away from the camera.]
]

MAKEUP LEVEL TO APPLY: [<LEVEL_REQUERIDO>]

[...MISMO AUTHENTIC CREATOR Y REPEATING INGREDIENTS...]
```

---

## 4. Prompt de Vídeo / Reel (VIDEO)

* **Propósito:** Diseñar un Reel de 3 tomas. Incorpora secciones específicas de audio (voz en off o silencioso) y video performance (gesticulaciones, dirección de la mirada).

```text
HIGH-FIDELITY CHARACTER DNA: Master. [<DESCRIPCIÓN_FÍSICA_DEL_AVATAR_EN_INGLÉS>]

[...MISMO ENCABEZADO DE PROTOCOLO DE MAQUILLAJE...]

DYNAMIC SCENE: [
SHOT 1: [Detailed description of Shot 1 (UGC mobile aesthetic, specific action).]
SHOT 2: [Repeat exact outfit, hairstyle, lighting, and setting details of SHOT 1, but changing camera scale/angle and action.]
SHOT 3: [Repeat exact outfit, hairstyle, lighting, and setting details of SHOT 1, but showing the final close-up action.]
]

MAKEUP LEVEL TO APPLY: [<LEVEL_REQUERIDO>]

[...MISMO AUTHENTIC CREATOR Y REPEATING INGREDIENTS...]

AUDIO PERFORMANCE:
<INSTRUCCIONES_DE_AUDIO_EJ_SILENT_O_VOICEOVER_VENEZUELAN_ACCENT_Neutro>
VIDEO PERFORMANCE:
<INSTRUCCIONES_DE_ACTUACIÓN_EJ_EYE_CONTACT_HAND_MOVEMENTS>
```

---

## 5. Prompt de Flyer Publicitario (FLYER)

* **Propósito:** Crear composiciones comerciales de alta gama (revista, revista de moda o infoproductos), indicándole a la IA la inserción de títulos tipográficos legibles superpuestos detrás o delante del avatar.

```text
HIGH-FIDELITY CHARACTER DNA: Master. [<DESCRIPCIÓN_FÍSICA_DEL_AVATAR_EN_INGLÉS>]

MAKEUP PROTOCOL — Context-adaptive:
[...MISMO ENCABEZADO DE PROTOCOLO DE MAQUILLAJE...]

DYNAMIC SCENE: [
A luxury commercial advertising layout featuring <[ ] AVATAR_NAME> posing professionally.
1. MAIN HEADLINE: The words "<TEXTO_DE_GANCHO>" written in elegant large serif typography.
2. SUBTITLE: The text "<BENEFICIO_O_SOLUCIÓN>" placed cleanly below the headline.
3. CTA: The call to action "<ACCION_A_TOMAR>" placed in a bottom corner badge.
4. BRANDING: The brand name "<MARCA>" written in clean minimalist logo typography.
The letters are giant and partially overlap behind the avatar's head and hair to create a professional multi-layered cover effect.
]

MAKEUP LEVEL TO APPLY: [LEVEL 3]

AUTHENTIC CREATOR: [Shot on a high-fashion digital camera (Sony A7R IV), soft commercial studio lighting, backdrop matching the theme...]

PRODUCT REFERENCE: [<DESCRIPCIÓN_DEL_PRODUCTO_A_PROMOCIONAR_1:1>]
```
