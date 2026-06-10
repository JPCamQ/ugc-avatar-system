import { useState, useEffect, useCallback } from "react";
import { AvatarIdentity, ChatSimulation, ChatMessage } from "@/lib/db";
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

  // Cargar chats por avatar
  useEffect(() => {
    if (!currentAvatar?.id) return;
    const savedSimulations = localStorage.getItem(`ugc_simulations_${currentAvatar.id}`);
    if (savedSimulations) {
      try {
        setSimulations(JSON.parse(savedSimulations));
      } catch (e) {
        console.error("Error al parsear chats:", e);
        setSimulations([]);
      }
    } else {
      // Inyectar simulaciones por defecto para Milena Reyes
      if (currentAvatar.id === "milena_reyes") {
        const defaultSims: ChatSimulation[] = [
          {
            id: "sim1",
            avatarId: "milena_reyes",
            userName: "mariana_style",
            userBio: "24 años. Entusiasta del fitness de Bogotá. Busca inspiración en las rutinas y el estilo de vida activo de Milena en Miami.",
            status: "active",
            messages: [
              { id: "m1", sender: "user", text: "¡Hola Milena! Me encantan tus historias entrenando en Miami, ¿de dónde son los leggins y el top deportivo que mostraste ayer?", timestamp: "10:30" },
              { id: "m2", sender: "avatar", text: "¡Hola Mariana! Qué lindo saludarte. Sii, ese conjunto me encanta porque es súper cómodo para los entrenamientos intensos. Es de la nueva colección de ropa deportiva que uso. Te paso mi link si quieres entrenar con el mismo outfit.", timestamp: "10:32" },
              { id: "m3", sender: "user", text: "¡Sii por fa! Es que me encanta tu disciplina y cómo mantienes esa definición, eres mi motivación diaria.", timestamp: "10:35" }
            ]
          },
          {
            id: "sim2",
            avatarId: "milena_reyes",
            userName: "carlos_fit90",
            userBio: "31 años. Entrenador personal de CDMX. Sigue a Milena por su disciplina en los gimnasios de Miami y su mentalidad inquebrantable de gym.",
            status: "active",
            messages: [
              { id: "mc1", sender: "user", text: "¡Hola Milena! Brutal tu Reel entrenando en Miami. ¿Cómo manejas la disciplina diaria con tanto calor y cuál es tu rutina clave de hombros para definir?", timestamp: "Ayer" }
            ]
          }
        ];
        setSimulations(defaultSims);
        localStorage.setItem(`ugc_simulations_milena_reyes`, JSON.stringify(defaultSims));
      } else {
        setSimulations([]);
      }
    }
    setActiveSimulationId(null);
  }, [currentAvatar?.id]);

  // Enviar mensaje en simulación activa
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || !activeSimulationId) return;

    const currentSim = simulations.find(s => s.id === activeSimulationId);
    if (!currentSim) return;

    const userMsg: ChatMessage = {
      id: `msg_${generateId()}`,
      sender: "user",
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...currentSim.messages, userMsg];
    
    // Actualización optimista
    setSimulations((prevSims) => {
      const nextSimulations = prevSims.map(s => 
        s.id === activeSimulationId ? { ...s, messages: updatedMessages } : s
      );
      localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(nextSimulations));
      return nextSimulations;
    });

    setChatInput("");
    setIsAvatarTyping(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          avatar: currentAvatar,
          messages: updatedMessages
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      // Si el avatar incluye algún link o producto, marcamos como convertido
      let newStatus = currentSim.status;
      if (currentAvatar.monetizationLink && data.reply.includes(currentAvatar.monetizationLink)) {
        newStatus = "converted";
      }

      setSimulations((prevSims) => {
        const finalSims = prevSims.map(s => 
          s.id === activeSimulationId 
            ? { ...s, messages: [...updatedMessages, avatarMsg], status: newStatus } 
            : s
        );
        localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(finalSims));
        return finalSims;
      });
    } catch (err: any) {
      console.error(err);
      showError(err.message || "Error al obtener respuesta del avatar de IA.");
    } finally {
      setIsAvatarTyping(false);
    }
  }, [chatInput, activeSimulationId, simulations, currentAvatar, apiKey, showError]);

  // Enviar recomendación forzada de lifestyle
  const handleForceSendLink = useCallback(() => {
    if (!activeSimulationId) return;
    
    setSimulations((prevSims) => {
      const currentSim = prevSims.find(s => s.id === activeSimulationId);
      if (!currentSim) return prevSims;

      const linkMsg: ChatMessage = {
        id: `msg_link_${generateId()}`,
        sender: "avatar",
        text: `¡Hola! Te recomiendo muchísimo seguir mi recomendación del día ✨. Si quieres ver cómo mantengo mi disciplina diaria, mis rutinas en Miami y este estilo de vida fitness sin descuidar mis ingresos, dale una mirada a mi link del perfil. ¡A entrenar duro! ${currentAvatar.monetizationLink ? currentAvatar.monetizationLink : ""}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const finalSim = {
        ...currentSim,
        messages: [...currentSim.messages, linkMsg],
        status: "converted" as const
      };

      const finalSims = prevSims.map(s => s.id === activeSimulationId ? finalSim : s);
      localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(finalSims));
      return finalSims;
    });

    showSuccess("Mensaje con recomendación y enlace enviado.");
  }, [activeSimulationId, currentAvatar.monetizationLink, showSuccess]);

  // Crear una nueva simulación de chat
  const handleCreateNewSim = useCallback((userName?: string, userBio?: string) => {
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

    const newSim: ChatSimulation = {
      id: `sim_${generateId()}`,
      avatarId: currentAvatar.id,
      userName: finalUserName,
      userBio: finalUserBio,
      messages: [],
      status: "active"
    };

    setSimulations((prevSims) => {
      const updated = [...prevSims, newSim];
      localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(updated));
      return updated;
    });

    setActiveSimulationId(newSim.id);
    showSuccess(`Nueva conversación iniciada con @${finalUserName}`);
  }, [currentAvatar.id, showSuccess]);

  // Eliminar una simulación de chat
  const handleDeleteSimulation = useCallback((simId: string) => {
    setSimulations((prevSims) => {
      const updated = prevSims.filter(s => s.id !== simId);
      localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(updated));
      return updated;
    });

    if (activeSimulationId === simId) {
      setActiveSimulationId(null);
    }
    showSuccess("Conversación eliminada.");
  }, [activeSimulationId, showSuccess]);

  // Actualizar estado comercial de la simulación
  const handleUpdateSimulationStatus = useCallback((simId: string, status: "active" | "converted" | "lost") => {
    setSimulations((prevSims) => {
      const updated = prevSims.map(s => s.id === simId ? { ...s, status } : s);
      localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(updated));
      return updated;
    });
    showSuccess(`Conversación marcada como: ${status === "converted" ? "Convertida" : status === "lost" ? "Perdida" : "Activa"}`);
  }, [showSuccess]);

  // Guardar notas sobre el prospecto
  const handleSaveSimulationNotes = useCallback((simId: string, notes: string) => {
    setSimulations((prevSims) => {
      const updated = prevSims.map(s => s.id === simId ? { ...s, notes } : s);
      localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(updated));
      return updated;
    });
    showSuccess("Notas del prospecto guardadas.");
  }, [showSuccess]);

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
