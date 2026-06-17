/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callDeepSeek } from "@/lib/deepseek";

describe("callDeepSeek", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debería retornar el contenido correcto si la API responde con éxito en el primer intento", async () => {
    const mockResponse = {
      choices: [{ message: { content: "Respuesta de la IA" } }]
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await callDeepSeek("mock-key", [{ role: "user", content: "Hola" }], false, 3, 1);

    expect(result).toBe("Respuesta de la IA");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("debería reintentar en caso de error transitorio y eventualmente tener éxito", async () => {
    const mockResponse = {
      choices: [{ message: { content: "Respuesta en intento exitoso" } }]
    };

    // Falla el primero, tiene éxito el segundo
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Internal Server Error",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

    const result = await callDeepSeek("mock-key", [{ role: "user", content: "Hola" }], false, 3, 1);

    expect(result).toBe("Respuesta en intento exitoso");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("debería reintentar en caso de Timeout (AbortError)", async () => {
    const mockResponse = {
      choices: [{ message: { content: "Éxito tras timeout" } }]
    };

    const abortError = new Error("The user aborted a request.");
    abortError.name = "AbortError";

    // Primer intento arroja AbortError, segundo éxito
    (global.fetch as any)
      .mockRejectedValueOnce(abortError)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

    const result = await callDeepSeek("mock-key", [{ role: "user", content: "Hola" }], false, 3, 1);

    expect(result).toBe("Éxito tras timeout");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("debería lanzar un error tras agotar todos los reintentos permitidos", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      text: async () => "Error del Servidor",
    });

    await expect(
      callDeepSeek("mock-key", [{ role: "user", content: "Hola" }], false, 3, 1)
    ).rejects.toThrow("DeepSeek API Error: 500 - Error del Servidor");
    
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
