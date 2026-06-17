import { describe, it, expect } from "vitest";
import { parsePromptSteps, parseRepeatingIngredients } from "@/lib/utils";

describe("parsePromptSteps", () => {
  it("debería retornar un array vacío si el prompt no contiene DYNAMIC SCENE", () => {
    const prompt = "Este es un prompt de prueba sin la sección requerida.";
    const result = parsePromptSteps(prompt, "video");
    expect(result).toEqual([]);
  });

  it("debería parsear correctamente las tomas de video/reels", () => {
    const prompt = `HIGH-FIDELITY CHARACTER DNA: [Milena Reyes DNA]
DYNAMIC SCENE:
SHOT 1: Milena se encuentra entrenando en el gimnasio con mancuernas.
SHOT 2: Milena toma un batido de proteínas mientras sonríe a la cámara.
AUTHENTIC CREATOR: Shot on iPhone`;

    const result = parsePromptSteps(prompt, "video");
    expect(result.length).toBe(2);
    expect(result[0].label).toBe("Toma 1");
    expect(result[0].text).toContain("SHOT 1: Milena se encuentra entrenando");
    expect(result[0].fullText).toContain("DYNAMIC SCENE: SHOT 1: Milena se encuentra entrenando");
    expect(result[0].fullText).toContain("AUTHENTIC CREATOR: Shot on iPhone");

    expect(result[1].label).toBe("Toma 2");
    expect(result[1].text).toContain("SHOT 2: Milena toma un batido");
  });

  it("debería parsear correctamente las fotos de carrusel", () => {
    const prompt = `HEADER_GOES_HERE
DYNAMIC SCENE:
FOTO 1: Posando de pie frente al espejo del vestidor.
FOTO 2: Atándose los cordones de los zapatos deportivos.
---
MAKEUP LEVEL TO APPLY: 1`;

    const result = parsePromptSteps(prompt, "carousel");
    expect(result.length).toBe(2);
    expect(result[0].label).toBe("Foto 1");
    expect(result[0].text).toContain("FOTO 1: Posando de pie");
    expect(result[0].fullText).toContain("HEADER_GOES_HERE");
    expect(result[0].fullText).toContain("MAKEUP LEVEL TO APPLY: 1");

    expect(result[1].label).toBe("Foto 2");
    expect(result[1].text).toContain("FOTO 2: Atándose los cordones");
  });
});

describe("parseRepeatingIngredients", () => {
  it("debería retornar los ingredientes repetidos", () => {
    const prompt = `HEADER
REPEATING INGREDIENTS:
- Mancuernas negras
- Top deportivo rojo
---
FOOTER`;
    const result = parseRepeatingIngredients(prompt);
    expect(result).toBe("- Mancuernas negras\n- Top deportivo rojo");
  });

  it("debería retornar string vacío si es 'none'", () => {
    const prompt = `HEADER
REPEATING INGREDIENTS: none
---
FOOTER`;
    const result = parseRepeatingIngredients(prompt);
    expect(result).toBe("");
  });

  it("debería retornar string vacío si no se encuentra la sección", () => {
    const prompt = "HEADER sin ingredientes.";
    const result = parseRepeatingIngredients(prompt);
    expect(result).toBe("");
  });
});
