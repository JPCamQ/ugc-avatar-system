import { useState, useCallback } from "react";

export function useClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, label: string) => {
    if (!text) return;
    
    // Intento con la API moderna de clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedText(label);
          setTimeout(() => setCopiedText(null), 2000);
        })
        .catch((err) => {
          console.error("Error al copiar usando Clipboard API: ", err);
          fallbackCopy(text, label);
        });
    } else {
      fallbackCopy(text, label);
    }
  }, []);

  const fallbackCopy = (text: string, label: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Evitar scroll en la pantalla
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopiedText(label);
        setTimeout(() => setCopiedText(null), 2000);
      } else {
        console.error("Fallback de copia falló.");
      }
    } catch (err) {
      console.error("Error en fallback de copia: ", err);
    }
  };

  return { copiedText, copyToClipboard };
}
