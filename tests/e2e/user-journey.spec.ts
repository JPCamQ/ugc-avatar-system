import { test, expect } from "@playwright/test";

test("Flujo completo: Crear Avatar -> Generar Idea -> Generar Prompt Flow -> Generar Caption", async ({ page }) => {
  // 1. Mock de llamadas a la API
  await page.route("**/api/avatar/expand", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: {
        expandedData: {
          nombre_completo: "Sofia Varela",
          edad: 28,
          character_dna: "Sofia Varela DNA",
          audio_settings: "Sofia Varela Audio",
          video_performance: "Sofia Varela Video"
        }
      }
    });
  });

  await page.route("**/api/avatars", async (route) => {
    if (route.request().method() === "POST") {
      const payload = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: {
          data: {
            id: payload.id || "avatar_sofia_varela",
            name: payload.name || "Sofia Varela",
            age: payload.age || 28,
            niche: payload.niche || "Moda Sostenible",
            location: payload.location || "Madrid, España",
            backstory: payload.backstory || "Sofia backstory",
            monetizationLink: payload.monetizationLink || "",
            monetizationProduct: payload.monetizationProduct || "",
            toneOfVoice: payload.toneOfVoice || "Voz de Sofia",
            language: payload.language || "Español",
            characterDna: payload.characterDna || "Sofia Varela DNA",
            audioSettings: payload.audioSettings || "Sofia Audio Settings",
            videoSettings: payload.videoSettings || "Sofia Video Settings"
          }
        }
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/ideas", async (route) => {
    const method = route.request().method();
    if (method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: {
          ideas: [
            {
              id: "idea_1",
              avatarId: "avatar_sofia_varela",
              title: "Idea de Moda Sostenible en Madrid",
              type: "video",
              location: "Madrid, España",
              phase: "storytelling",
              scenePrompt: "Sofia camina por las calles de Madrid mostrando su ropa.",
              formattedFlowPrompt: "",
              instagramCaption: "",
              status: "draft"
            }
          ]
        }
      });
    } else if (method === "PUT") {
      const payload = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: {
          data: {
            id: payload.id,
            avatarId: "avatar_sofia_varela",
            title: "Idea de Moda Sostenible en Madrid",
            type: "video",
            location: "Madrid, España",
            phase: "storytelling",
            scenePrompt: payload.scenePrompt || "Sofia camina por las calles de Madrid mostrando su ropa.",
            formattedFlowPrompt: payload.formattedFlowPrompt || "",
            instagramCaption: payload.instagramCaption || "",
            status: payload.status || "draft"
          }
        }
      });
    } else {
      await route.continue();
    }
  });

  await page.route("**/api/prompt", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: {
        flowPrompt: "DYNAMIC SCENE: SHOT 1: Sofia sonríe en la Gran Vía madrileña."
      }
    });
  });

  await page.route("**/api/caption", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      json: {
        caption: "Este es el copy de Instagram para Sofia."
      }
    });
  });

  // 2. Navegar al Dashboard
  await page.goto("/dashboard/identity");

  // Si existe un input de API Key, lo rellenamos
  const apiKeyInput = page.locator("input[type='password']");
  if (await apiKeyInput.isVisible()) {
    await apiKeyInput.fill("sk-mockapi-key-here-for-test");
    await page.click("button:has-text('Guardar')");
  }

  // 3. Crear nuevo avatar
  // Usamos el botón 'Nuevo' del Header
  await page.click("button[title='Añadir Avatar de Cliente']");
  await page.fill("input[placeholder*='Ej. Fitness']", "Moda Sostenible");
  await page.fill("input[placeholder*='Ej. Latina']", "Madrid, España");
  await page.click("button:has-text('Crear e Iniciar')");

  // Esperar a que se actualice la vista al nuevo avatar
  // Lo seleccionamos explícitamente en el combobox del Header para asegurar la transición determinista
  await page.selectOption("select", { label: "Sofia Varela" });
  await expect(page.locator("h3:has-text('Sofia Varela')")).toBeVisible();

  // 4. Ir a Planificador Editorial (usando el tag 'a' del Sidebar)
  await page.click("a:has-text('Planificador Editorial')");

  // Generar ideas
  await page.click("button:has-text('Generar 5 Ideas')");
  await expect(page.locator("text=Idea de Moda Sostenible en Madrid")).toBeVisible();

  // Seleccionar la idea generada
  await page.click("text=Idea de Moda Sostenible en Madrid");

  // Generar prompt de Flow
  await page.click("button:has-text('Crear Prompt de Flow')");
  await expect(page.locator("text=SHOT 1: Sofia sonríe")).toBeVisible();

  // Generar pie de foto (caption)
  await page.click("button:has-text('Generar Copy Instagram')");
  await expect(page.locator("textarea[readonly]")).toHaveValue("Este es el copy de Instagram para Sofia.");
});
