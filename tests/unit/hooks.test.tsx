/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAvatars } from "@/hooks/useAvatars";
import { DEFAULT_AVATAR } from "@/lib/types";

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: any) => { store[key] = value !== undefined && value !== null ? value.toString() : ""; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
vi.stubGlobal("localStorage", localStorageMock);

describe("useAvatars Hook", () => {
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorageMock.clear();
    mockShowSuccess.mockClear();
    mockShowError.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debería inicializar y cargar los avatares desde la API", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [DEFAULT_AVATAR] }),
    });

    const { result } = renderHook(() => useAvatars({ showSuccess: mockShowSuccess, showError: mockShowError }));

    // Esperar a que terminen los efectos asíncronos iniciales
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.avatars.length).toBe(1);
    expect(result.current.avatars[0].id).toBe("milena_reyes");
  });

  it("debería fallar al crear avatar si el nicho es muy corto (validación Zod)", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [DEFAULT_AVATAR] }),
    });

    const { result } = renderHook(() => useAvatars({ showSuccess: mockShowSuccess, showError: mockShowError }));

    // Esperar carga inicial
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Cambiar datos del formulario a algo inválido (nicho de 2 letras)
    act(() => {
      result.current.setNewAvatarForm({
        gender: "Femenino",
        niche: "Fi", // Inválido: mínimo 3 caracteres
        location: "Miami, FL",
        bodyType: "fitness",
      });
    });

    // Intentar crear avatar
    await act(async () => {
      await result.current.handleCreateAvatar();
    });

    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining("niche: El nicho debe tener al menos 3 caracteres")
    );
    expect(global.fetch).toHaveBeenCalledTimes(1); // Solo la consulta GET inicial
  });

  it("debería fallar al guardar avatar si la edad está fuera de rango (validación Zod)", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [DEFAULT_AVATAR] }),
    });

    const { result } = renderHook(() => useAvatars({ showSuccess: mockShowSuccess, showError: mockShowError }));

    // Carga inicial
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // Iniciar edición
    act(() => {
      result.current.setIsEditingIdentity(true);
    });

    // Cambiar edad a 12 (Inválida: mínimo 18)
    act(() => {
      result.current.updateCurrentAvatarField("age", 12);
    });

    // Intentar guardar
    await act(async () => {
      await result.current.handleSaveIdentity();
    });

    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining("age: La edad mínima es 18")
    );
  });
});
