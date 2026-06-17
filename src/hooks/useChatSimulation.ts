import { useState, useEffect, useCallback, useRef } from "react";
import { AvatarIdentity, ChatSimulation, ChatMessage } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface UseChatSimulationProps {
  currentAvatar: AvatarIdentity;
  apiKey: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export function useChatSimulation({ currentAvatar, apiKey, showSuccess, showError }: UseChatSimulationProps) {
  const [simulations, setSimulations] = useState<ChatSimulation[]>([]);
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isAvatarTyping, setIsAvatarTyping] = useState(false);

  // Refs mutables para estabilizar callbacks
  const simulationsRef = useRef(simulations);
  const activeSimulationIdRef = useRef(activeSimulationId);
  const currentAvatarRef = useRef(currentAvatar);

  useEffect(() => {
    simulationsRef.current = simulations;
  }, [simulations]);

  useEffect(() => {
    activeSimulationIdRef.current = activeSimulationId;
  }, [activeSimulationId]);

  useEffect(() => {
    currentAvatarRef.current = currentAvatar;
  }, [currentAvatar]);

  // Cargar chats por avatar desde la base de datos local SQLite
  useEffect(() => {
    if (!currentAvatar?.id) return;

    const fetchSimulations = async () => {
      try {
        const res = await fetch(`/api/chat/simulations?avatarId=${currentAvatar.id}`);
        if (!res.ok) throw new Error("Error en respuesta de API");
        const data = await res.json();
        
        let loadedSims: ChatSimulation[] = data.data || [];

        // Sembramos simulaciones de demostración para Milena Reyes si está vacía
        if (loadedSims.length === 0 && currentAvatar.id === "milena_reyes") {
          const defaultSims = [
            {
              id: "sim1",
              avatarId: "milena_reyes",
              userName: "mariana_style",
              userBio: "24 años. Entusiasta del fitness de Bogotá. Busca inspiración en las rutinas y el estilo de vida activo de Milena en Miami.",
              status: "active",
              notes: ""
            },
            {
              id: "sim2",
              avatarId: "milena_reyes",
              userName: "carlos_fit90",
              userBio: "31 años. Entrenador personal de CDMX. Sigue a Milena por su disciplina en los gimnasios de Miami y su mentalidad inquebrantable de gym.",
              status: "active",
              notes: ""
            }
          ];

          // Persistir en servidor
          const createdSims = [];
          for (const s of defaultSims) {
            const createRes = await fetch("/api/chat/simulations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "create", simulation: s })
            });
            const createData = await createRes.json();
            if (createRes.ok && createData.data) {
              createdSims.push(createData.data);
            }
          }

          // Mensajes por defecto de Mariana
          const defaultMessages = [
            { id: "m1", sender: "user", text: "¡Hola Milena! Me encantan tus historias entrenando en Miami, ¿de dónde son los leggins y el top deportivo que mostraste ayer?", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
            { id: "m2", sender: "avatar", text: "¡Hola Mariana! Qué lindo saludarte. Sii, ese conjunto me encanta porque es súper cómodo para los entrenamientos intensos. Es de la ropa que uso siempre. Si quieres te paso mi link.", timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
            { id: "m3", sender: "user", text: "¡Sii por fa! Es que me encanta tu disciplina y cómo mantienes esa definición, eres mi motivación diaria.", timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString() }
          ];

          for (const msg of defaultMessages) {
            await fetch("/api/chat/simulations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "message", simulationId: "sim1", message: msg })
            });
          }

          // Mensaje de Carlos
          const carlosMsg = { id: "mc1", sender: "user", text: "¡Hola Milena! Brutal tu Reel entrenando en Miami. ¿Cómo manejas la disciplina diaria con tanto calor y cuál es tu rutina clave de hombros para definir?", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() };
          await fetch("/api/chat/simulations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "message", simulationId: "sim2", message: carlosMsg })
          });

          // Refetch final
          const refetchRes = await fetch(`/api/chat/simulations?avatarId=${currentAvatar.id}`);
          const refetchData = await refetchRes.json();
          loadedSims = refetchData.data || defaultSims;
        }

        setSimulations(loadedSims);
      } catch (err) {
        console.error("Fallo al obtener simulaciones del servidor:", err);
        setSimulations([]);
      }
    };

    fetchSimulations();
    setActiveSimulationId(null);
  }, [currentAvatar?.id]);

  // Enviar mensaje en simulación activa
  const handleSendMessage = useCallback(async () => {
    const activeId = activeSimulationIdRef.current;
    if (!chatInput.trim() || !activeId) return;

    const currentSim = simulationsRef.current.find(s => s.id === activeId);
    if (!currentSim) return;

    const userMsg: ChatMessage = {
      id: `msg_${generateId()}`,
      sender: "user",
      text: chatInput.trim(),
      timestamp: new Date().toISOString()
    };

    // 1. Persistir mensaje del usuario en SQLite
    try {
      const msgRes = await fetch("/api/chat/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "message",
          simulationId: activeId,
          message: userMsg
        })
      });

      if (!msgRes.ok) throw new Error("Fallo al guardar mensaje del usuario");

      // Actualización local optimista
      setSimulations((prevSims) => {
        return prevSims.map(s => 
          s.id === activeId ? { ...s, messages: [...s.messages, userMsg] } : s
        );
      });

      setChatInput("");
      setIsAvatarTyping(true);

      // 2. Generar respuesta de la IA
      const updatedMessagesForApi = [...currentSim.messages, userMsg];
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          avatar: currentAvatarRef.current,
          messages: updatedMessagesForApi
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el chat (${response.status})`);
      }

      const avatarMsg: ChatMessage = {
        id: `msg_avatar_${generateId()}`,
        sender: "avatar",
        text: data.reply,
        timestamp: new Date().toISOString()
      };

      // 3. Persistir mensaje de la IA en la DB
      await fetch("/api/chat/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "message",
          simulationId: activeId,
          message: avatarMsg
        })
      });

      // Si el avatar incluye algún link, marcamos como convertido en DB
      let newStatus = currentSim.status;
      const avatarLink = currentAvatarRef.current.monetizationLink;
      if (avatarLink && data.reply.includes(avatarLink)) {
        newStatus = "converted";
        await fetch("/api/chat/simulations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activeId, status: "converted" })
        });
      }

      setSimulations((prevSims) => {
        return prevSims.map(s => 
          s.id === activeId 
            ? { ...s, messages: [...s.messages.filter(m => m.id !== avatarMsg.id), avatarMsg], status: newStatus } 
            : s
        );
      });
    } catch (err: any) {
      console.error(err);
      showError(err.message || "Error al procesar el chat con la base de datos.");
    } finally {
      setIsAvatarTyping(false);
    }
  }, [chatInput, apiKey, showError]);

  // Enviar recomendación forzada de lifestyle
  const handleForceSendLink = useCallback(async () => {
    const activeId = activeSimulationIdRef.current;
    if (!activeId) return;

    const currentSim = simulationsRef.current.find(s => s.id === activeId);
    if (!currentSim) return;

    const avatarLink = currentAvatarRef.current.monetizationLink;
    const linkMsg: ChatMessage = {
      id: `msg_link_${generateId()}`,
      sender: "avatar",
      text: `¡Hola! Te recomiendo muchísimo seguir mi recomendación del día ✨. Si quieres ver cómo mantengo mi disciplina diaria, mis rutinas en Miami y este estilo de vida fitness sin descuidar mis ingresos, dale una mirada a mi link del perfil. ¡A entrenar duro! ${avatarLink ? avatarLink : ""}`,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Guardar mensaje en DB
      await fetch("/api/chat/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "message",
          simulationId: activeId,
          message: linkMsg
        })
      });

      // 2. Actualizar estado comercial a convertido en DB
      await fetch("/api/chat/simulations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeId, status: "converted" })
      });

      setSimulations((prevSims) => {
        return prevSims.map(s => s.id === activeId ? {
          ...s,
          messages: [...s.messages, linkMsg],
          status: "converted" as const
        } : s);
      });

      showSuccess("Mensaje con recomendación y enlace enviado y guardado.");
    } catch {
      showError("Error al forzar el envío del link en el servidor.");
    }
  }, [showSuccess, showError]);

  // Crear una nueva simulación de chat
  const handleCreateNewSim = useCallback(async (userName?: string, userBio?: string) => {
    const defaultNames = ["camila_fit", "mateo_fit", "sofia_active", "daniel_discipline"];
    const defaultBios = [
      "25 años. De Santiago. Apasionada del fitness y la vida activa en la playa. Busca inspiración y tips de entrenamiento.",
      "29 años. De Bogotá. Amante del gym de alta intensidad. Busca motivación e ideas de rutinas exigentes de Milena.",
      "27 años. De Madrid. Apasionada del deporte de fuerza y el lifestyle saludable. Sigue a Milena por su disciplina en Miami.",
      "32 años. De Lima. Emprendedor y atleta. Sigue a Milena por su mentalidad ganadora en el gimnasio y los negocios."
    ];

    const randomIndex = Math.floor(Math.random() * defaultNames.length);
    const finalUserName = userName && userName.trim() !== "" ? userName.trim() : defaultNames[randomIndex];
    const finalUserBio = userBio && userBio.trim() !== "" ? userBio.trim() : defaultBios[randomIndex];

    const newSim = {
      id: `sim_${generateId()}`,
      avatarId: currentAvatarRef.current.id,
      userName: finalUserName,
      userBio: finalUserBio,
      status: "active",
      notes: ""
    };

    try {
      const res = await fetch("/api/chat/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", simulation: newSim })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Error en servidor al crear simulación");

      const savedSim = data.data;

      setSimulations((prevSims) => [...prevSims, savedSim]);
      setActiveSimulationId(savedSim.id);
      showSuccess(`Nueva conversación iniciada con @${savedSim.userName}`);
    } catch {
      showError("No se pudo iniciar la conversación en el servidor.");
    }
  }, [showSuccess, showError]);

  // Eliminar una simulación de chat en DB y Local
  const handleDeleteSimulation = useCallback(async (simId: string) => {
    const activeId = activeSimulationIdRef.current;
    try {
      const res = await fetch(`/api/chat/simulations?id=${simId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Fallo al eliminar simulación en servidor.");

      setSimulations((prevSims) => prevSims.filter(s => s.id !== simId));
      if (activeId === simId) {
        setActiveSimulationId(null);
      }
      showSuccess("Conversación eliminada.");
    } catch {
      showError("No se pudo eliminar la conversación de la base de datos.");
    }
  }, [showSuccess, showError]);

  // Actualizar estado comercial de la simulación
  const handleUpdateSimulationStatus = useCallback(async (simId: string, status: "active" | "converted" | "lost") => {
    try {
      const res = await fetch("/api/chat/simulations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: simId, status })
      });
      if (!res.ok) throw new Error("Fallo al actualizar estado.");

      setSimulations((prevSims) => {
        return prevSims.map(s => s.id === simId ? { ...s, status } : s);
      });
      showSuccess(`Conversación marcada como: ${status === "converted" ? "Convertida" : status === "lost" ? "Perdida" : "Activa"}`);
    } catch {
      showError("No se pudo actualizar el estado comercial.");
    }
  }, [showSuccess, showError]);

  // Guardar notas sobre el prospecto
  const handleSaveSimulationNotes = useCallback(async (simId: string, notes: string) => {
    try {
      const res = await fetch("/api/chat/simulations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: simId, notes })
      });
      if (!res.ok) throw new Error("Fallo al guardar notas.");

      setSimulations((prevSims) => {
        return prevSims.map(s => s.id === simId ? { ...s, notes } : s);
      });
      showSuccess("Notas del prospecto guardadas.");
    } catch {
      showError("No se pudo guardar las notas en el servidor.");
    }
  }, [showSuccess, showError]);

  return {
    simulations,
    activeSimulationId,
    setActiveSimulationId,
    chatInput,
    setChatInput,
    isAvatarTyping,
    handleSendMessage,
    handleForceSendLink,
    handleCreateNewSim,
    handleDeleteSimulation,
    handleUpdateSimulationStatus,
    handleSaveSimulationNotes
  };
}
