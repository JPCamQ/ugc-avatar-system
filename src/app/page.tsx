"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Key, User, Calendar, MessageCircle, DollarSign, 
  Copy, Check, Send, ArrowRight, RefreshCw, Smartphone, 
  TrendingUp, Users, ExternalLink, Globe, Play, Compass, Wallet,
  Upload, Trash, UserPlus, ShieldAlert, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_AVATAR, AvatarIdentity, PostIdea, ChatSimulation, ChatMessage, GrowthPhase } from "@/lib/db";

export default function Dashboard() {
  // Configuración de API Key de DeepSeek
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pestaña Activa
  const [activeTab, setActiveTab] = useState<"identity" | "setup" | "planner" | "chat" | "metrics">("identity");

  // Lista de Avatares (Multi-Avatar)
  const [avatars, setAvatars] = useState<AvatarIdentity[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [showCreateAvatarModal, setShowCreateAvatarModal] = useState(false);
  
  // Formulario para Crear Nuevo Avatar (Cliente)
  const [newAvatarForm, setNewAvatarForm] = useState<Omit<AvatarIdentity, "id">>({
    name: "",
    age: 25,
    niche: "Fitness & Estilo de Vida",
    location: "Miami, FL",
    backstory: "",
    monetizationLink: "https://link-afiliado.com/ejemplo",
    monetizationProduct: "Recetario Fitness + Código de descuento",
    toneOfVoice: "Motivador, enérgico, disciplinado.",
    language: "Español",
    characterDna: "Photorealistic photograph of a 25-year-old blonde woman in athletic gear.",
    audioSettings: "ACCENT: Neutral Spanish, energetic diction.\nPAUSES: Natural rhythm.\nMICROPHONE: High-end podcast mic.\nSPEED: Fast and engaging.",
    videoSettings: "EYE CONTACT: Direct.\nMICRO-EXPRESSIONS: Smiling and dynamic.\nGESTURES: Expressive hand movements."
  });

  // Datos del Avatar Seleccionado actualmente
  const [currentAvatar, setCurrentAvatar] = useState<AvatarIdentity>(DEFAULT_AVATAR);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);

  // Setup Viral de Cuenta (Instagram & TikTok)
  const [setupData, setSetupData] = useState<{
    usernames: string[];
    bios: string[];
    gridPlan: string[];
    seoTips: string[];
  } | null>(null);
  const [generatingSetup, setGeneratingSetup] = useState(false);

  // Planificador de Contenido
  const [selectedPhase, setSelectedPhase] = useState<GrowthPhase>("storytelling");
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<PostIdea | null>(null);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [postPromptInput, setPostPromptInput] = useState("");
  const [captionOutput, setCaptionOutput] = useState("");
  const [promptOutput, setPromptOutput] = useState("");

  // Simulador de Chats
  const [simulations, setSimulations] = useState<ChatSimulation[]>([]);
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isAvatarTyping, setIsAvatarTyping] = useState(false);
  
  // Estado de Carga / Copiado / Alertas
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Chat scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper para validar la API key
  const isKeyValid = (key: string) => {
    return key && key.trim() !== "" && key.trim() !== "undefined";
  };

  // Parser para extraer prompts individuales completos de tomas de video o fotos de carrusel
  const parsePromptSteps = (fullPrompt: string, type: "carousel" | "video" | "image") => {
    const rawType = String(type).toLowerCase();
    const isCarousel = rawType === "carousel" || rawType === "carrusel";
    const isVideo = rawType === "video" || rawType === "reels" || rawType === "reel";
    if (!fullPrompt || (!isCarousel && !isVideo)) return [];
    
    // 1. Encontrar el inicio de DYNAMIC SCENE de manera ultra robusta
    const dynamicSceneIndex = fullPrompt.search(new RegExp("DYNAMIC SCENE:", "i"));
    if (dynamicSceneIndex === -1) return [];
    
    const startPos = dynamicSceneIndex + "DYNAMIC SCENE:".length;
    const slice = fullPrompt.substring(startPos);
    
    // Encontrar el inicio de la siguiente sección (AUTHENTIC CREATOR, AUDIO PERFORMANCE, VIDEO PERFORMANCE, o separador ---)
    const nextSectionRegex = new RegExp("(\\s*(?:\\*?\\*?\\b(?:AUTHENTIC CREATOR|AUDIO PERFORMANCE|VIDEO PERFORMANCE)\\b|---))", "i");
    const nextSectionMatch = slice.match(nextSectionRegex);
    
    const endPos = nextSectionMatch && nextSectionMatch.index !== undefined
      ? startPos + nextSectionMatch.index
      : fullPrompt.length;
      
    const dynamicSceneText = fullPrompt.substring(startPos, endPos).trim();
    
    // Obtener la cabecera original del prompt antes de DYNAMIC SCENE
    const header = fullPrompt.substring(0, dynamicSceneIndex);
    
    // Obtener la parte final del prompt después de DYNAMIC SCENE
    const postScene = fullPrompt.substring(endPos).trim();
    
    const steps: Array<{ label: string; text: string; fullText: string }> = [];
    
    // Expresión regular ultra robusta para los pasos (PHOTO 1, SHOT 1, FOTO 1, etc.)
    const labelRegex = isCarousel 
      ? new RegExp("(\\*?\\*?\\b(?:PHOTO|FOTO|IMAGE|IMAGEN)\\b\\s*\\d+\\s*:?\\*?\\*?[\\s\\S]*?)(?=\\s*(?:\\*?\\*?\\b(?:PHOTO|FOTO|IMAGE|IMAGEN)\\b\\s*\\d+\\s*:?\\*?\\*?)|$)", "gi")
      : new RegExp("(\\*?\\*?\\b(?:SHOT|TOMA|VIDEO)\\b\\s*\\d+\\s*:?\\*?\\*?[\\s\\S]*?)(?=\\s*(?:\\*?\\*?\\b(?:SHOT|TOMA|VIDEO)\\b\\s*\\d+\\s*:?\\*?\\*?)|$)", "gi");
      
    const matches = Array.from(dynamicSceneText.matchAll(labelRegex));
    
    if (matches.length > 0) {
      matches.forEach((match, index) => {
        const stepContent = match[1].trim();
        const label = isCarousel ? `Foto ${index + 1}` : `Toma ${index + 1}`;
        // Reconstruir el prompt estructurado completo para este paso individual
        const singlePrompt = `${header}DYNAMIC SCENE: ${stepContent}\n\n${postScene}`;
        steps.push({
          label,
          text: stepContent,
          fullText: singlePrompt
        });
      });
    }
    
    return steps;
  };

  // Parser para extraer los ingredientes repetidos de la sección REPEATING INGREDIENTS
  const parseRepeatingIngredients = (fullPrompt: string) => {
    if (!fullPrompt) return "";
    const match = fullPrompt.match(new RegExp("REPEATING INGREDIENTS:\\s*([\\s\\S]*?)(?=\\n[A-Z-]{3,}|\\n---|\\s*$)", "i"));
    if (!match) return "";
    const text = match[1].trim();
    const cleanLower = text.toLowerCase();
    if (cleanLower === "none" || cleanLower === "none." || cleanLower.includes("[none]")) return "";
    return text;
  };

  // Inicializar localStorage al montar el componente
  useEffect(() => {
    // 1. Cargar API Key
    const savedKey = localStorage.getItem("deepseek_avatar_api_key");
    if (savedKey && savedKey !== "undefined" && savedKey.trim() !== "") {
      setApiKey(savedKey);
    } else {
      setApiKey("");
      localStorage.removeItem("deepseek_avatar_api_key");
      setShowApiKeyInput(true);
    }

    // 2. Cargar Lista de Avatares (Multi-Avatar)
    const savedAvatarsList = localStorage.getItem("ugc_multi_avatars_list");
    let initialAvatars: AvatarIdentity[] = [];
    if (savedAvatarsList) {
      try { 
        initialAvatars = JSON.parse(savedAvatarsList); 
        setAvatars(initialAvatars);
      } catch (e) { console.error(e); }
    } 

    if (initialAvatars.length === 0) {
      initialAvatars = [DEFAULT_AVATAR];
      setAvatars(initialAvatars);
      localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(initialAvatars));
    }

    // 3. Cargar Avatar Seleccionado
    const savedSelectedId = localStorage.getItem("ugc_selected_avatar_id");
    let currentId = savedSelectedId || initialAvatars[0].id;
    setSelectedAvatarId(currentId);
    localStorage.setItem("ugc_selected_avatar_id", currentId);

    const foundAvatar = initialAvatars.find(a => a.id === currentId) || initialAvatars[0];
    setCurrentAvatar(foundAvatar);

    // 4. Cargar Ideas de Posts específicas para el Avatar activo
    const savedIdeas = localStorage.getItem(`ugc_post_ideas_${currentId}`);
    if (savedIdeas) {
      try { setPostIdeas(JSON.parse(savedIdeas)); } catch (e) { console.error(e); }
    } else {
      setPostIdeas([]);
    }

    // 5. Cargar simulaciones específicas del Avatar activo
    const savedSimulations = localStorage.getItem(`ugc_simulations_${currentId}`);
    if (savedSimulations) {
      try { setSimulations(JSON.parse(savedSimulations)); } catch (e) { console.error(e); }
    } else {
      // Inicializar simulaciones por defecto para Valeria Cruz
      if (currentId === "valeria_cruz") {
        const defaultSims: ChatSimulation[] = [
          {
            id: "sim1",
            avatarId: "valeria_cruz",
            userName: "mariana_finanzas",
            userBio: "24 años. Estudiante de economía de Bogotá. Quiere aprender a generar ingresos online para pagarse un viaje de mochilera.",
            status: "active",
            messages: [
              { id: "m1", sender: "user", text: "Hola Valeria! Me encantan tus posts de viaje, en serio viajas sola?", timestamp: "10:30 AM" },
              { id: "m2", sender: "avatar", text: "¡Hola Mariana! Qué lindo saludarte. Sii, viajo sola desde hace casi un año. Al principio da un poquito de miedo pero es la experiencia más libre del mundo. ¿Tienes pensado algún destino?", timestamp: "10:32 AM" },
              { id: "m3", sender: "user", text: "Sí, me encantaría recorrer el cono sur, pero no sé cómo financiarlo siendo estudiante, no me alcanza lo que ahorro trabajando a medio tiempo.", timestamp: "10:35 AM" }
            ]
          },
          {
            id: "sim2",
            avatarId: "valeria_cruz",
            userName: "carlos_trip90",
            userBio: "31 años. Desarrollador junior de CDMX. Quiere ser nómada digital pero le da miedo no tener un flujo estable de ahorros o inversiones.",
            status: "active",
            messages: [
              { id: "mc1", sender: "user", text: "Hola! Vi tu Reel sobre la app de inversiones que te da libertad en los viajes. Es seguro para alguien que está empezando?", timestamp: "Ayer" }
            ]
          }
        ];
        setSimulations(defaultSims);
        localStorage.setItem(`ugc_simulations_valeria_cruz`, JSON.stringify(defaultSims));
      } else {
        setSimulations([]);
      }
    }
  }, []);

  // Al cambiar de Avatar seleccionado
  const handleSelectAvatarChange = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
    localStorage.setItem("ugc_selected_avatar_id", avatarId);
    
    const foundAvatar = avatars.find(a => a.id === avatarId);
    if (foundAvatar) {
      setCurrentAvatar(foundAvatar);
      
      // Cargar ideas de este avatar
      const savedIdeas = localStorage.getItem(`ugc_post_ideas_${avatarId}`);
      if (savedIdeas) {
        try { setPostIdeas(JSON.parse(savedIdeas)); } catch (e) { console.error(e); }
      } else {
        setPostIdeas([]);
      }
      setSelectedIdea(null);
      setPromptOutput("");
      setCaptionOutput("");

      // Cargar chats de este avatar
      const savedSimulations = localStorage.getItem(`ugc_simulations_${avatarId}`);
      if (savedSimulations) {
        try { setSimulations(JSON.parse(savedSimulations)); } catch (e) { console.error(e); }
      } else {
        setSimulations([]);
      }
      setActiveSimulationId(null);

      // Cargar setup de cuenta si existe
      const savedSetup = localStorage.getItem(`ugc_setup_${avatarId}`);
      if (savedSetup) {
        try { setSetupData(JSON.parse(savedSetup)); } catch (e) { console.error(e); }
      } else {
        setSetupData(null);
      }
      
      showSuccess(`Avatar cambiado a: ${foundAvatar.name}`);
    }
  };

  // Guardar cambio de estado temporal
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Subir foto de perfil (base64)
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("La imagen no debe superar los 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedAvatar = { ...currentAvatar, avatarImage: base64String };
        setCurrentAvatar(updatedAvatar);
        
        // Guardar en la lista global de avatares
        const updatedList = avatars.map(a => a.id === currentAvatar.id ? updatedAvatar : a);
        setAvatars(updatedList);
        localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));
        showSuccess("Foto de avatar cargada con éxito.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar foto de perfil
  const handleRemovePhoto = () => {
    const updatedAvatar = { ...currentAvatar, avatarImage: undefined };
    setCurrentAvatar(updatedAvatar);
    const updatedList = avatars.map(a => a.id === currentAvatar.id ? updatedAvatar : a);
    setAvatars(updatedList);
    localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));
    showSuccess("Foto de avatar eliminada.");
  };

  // Crear Nuevo Avatar (Cliente)
  const handleCreateAvatar = () => {
    if (!newAvatarForm.name.trim()) {
      setErrorMsg("Por favor, ingresa un nombre para el nuevo avatar.");
      return;
    }
    const newId = `avatar_${Date.now()}`;
    const newAvatar: AvatarIdentity = {
      ...newAvatarForm,
      id: newId
    };

    const updatedList = [...avatars, newAvatar];
    setAvatars(updatedList);
    localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));

    // Cerrar modal y seleccionar el nuevo avatar
    setShowCreateAvatarModal(false);
    handleSelectAvatarChange(newId);
    showSuccess(`Avatar '${newAvatar.name}' creado con éxito.`);
    
    // Resetear formulario
    setNewAvatarForm({
      name: "",
      age: 25,
      niche: "Fitness & Estilo de Vida",
      location: "Miami, FL",
      backstory: "",
      monetizationLink: "https://link-afiliado.com/ejemplo",
      monetizationProduct: "Recetario Fitness + Código de descuento",
      toneOfVoice: "Motivador, enérgico, disciplinado.",
      language: "Español",
      characterDna: "Photorealistic photograph of a 25-year-old blonde woman in athletic gear.",
      audioSettings: "ACCENT: Neutral Spanish, energetic diction.\nPAUSES: Natural rhythm.\nMICROPHONE: High-end podcast mic.\nSPEED: Fast and engaging.",
      videoSettings: "EYE CONTACT: Direct.\nMICRO-EXPRESSIONS: Smiling and dynamic.\nGESTURES: Expressive hand movements."
    });
  };

  // Eliminar un Avatar
  const handleDeleteAvatar = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatars.length <= 1) {
      setErrorMsg("Debe haber al menos un avatar en el sistema.");
      return;
    }
    if (confirm("¿Estás seguro de que deseas eliminar este avatar y todos sus datos asociados?")) {
      const updatedList = avatars.filter(a => a.id !== idToDelete);
      setAvatars(updatedList);
      localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));

      // Limpiar datos asociados
      localStorage.removeItem(`ugc_post_ideas_${idToDelete}`);
      localStorage.removeItem(`ugc_simulations_${idToDelete}`);
      localStorage.removeItem(`ugc_setup_${idToDelete}`);

      // Si eliminamos el seleccionado actual, cambiar al primero
      if (idToDelete === selectedAvatarId) {
        handleSelectAvatarChange(updatedList[0].id);
      } else {
        showSuccess("Avatar eliminado.");
      }
    }
  };

  // Guardar API Key de DeepSeek
  const handleSaveApiKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed || trimmed === "undefined") {
      setErrorMsg("Por favor, ingresa una API Key de DeepSeek válida.");
      return;
    }
    localStorage.setItem("deepseek_avatar_api_key", trimmed);
    setApiKey(trimmed);
    setShowApiKeyInput(false);
    setErrorMsg(null);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("deepseek_avatar_api_key");
    setApiKey("");
    setShowApiKeyInput(true);
  };

  // Copiado rápido
  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Guardar Identidad editada
  const handleSaveIdentity = () => {
    const updatedList = avatars.map(a => a.id === currentAvatar.id ? currentAvatar : a);
    setAvatars(updatedList);
    localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));
    setIsEditingIdentity(false);
    showSuccess("Identidad del avatar guardada.");
  };

  // API Call: Setup Viral de Cuenta
  const handleGetSetupData = async () => {
    if (!isKeyValid(apiKey)) {
      setErrorMsg("Por favor, ingresa tu API Key de DeepSeek.");
      setShowApiKeyInput(true);
      return;
    }
    setGeneratingSetup(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: currentAvatar, apiKey })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setSetupData(data.setupData);
      localStorage.setItem(`ugc_setup_${currentAvatar.id}`, JSON.stringify(data.setupData));
      showSuccess("Plan de setup viral generado con DeepSeek.");
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Error al conectar con la API de setup.");
    } finally {
      setGeneratingSetup(false);
    }
  };

  // API Call: Generar ideas de posts con DeepSeek filtrado por fase
  const handleGenerateIdeas = async () => {
    if (!isKeyValid(apiKey)) {
      setErrorMsg("Por favor, ingresa tu API Key de DeepSeek arriba.");
      setShowApiKeyInput(true);
      return;
    }
    setGeneratingIdeas(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: currentAvatar, phase: selectedPhase, apiKey })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const newIdeas: PostIdea[] = data.ideas.map((idea: any, idx: number) => {
        let normalizedType: "image" | "carousel" | "video" = "image";
        const rawType = String(idea.type || "").toLowerCase();
        if (rawType.includes("carousel") || rawType.includes("carrusel")) {
          normalizedType = "carousel";
        } else if (rawType.includes("video") || rawType.includes("reel") || rawType.includes("short")) {
          normalizedType = "video";
        }
        return {
          id: `idea_${Date.now()}_${idx}`,
          avatarId: currentAvatar.id,
          title: idea.title,
          type: normalizedType,
          location: idea.location,
          phase: selectedPhase,
          scenePrompt: idea.description,
          formattedFlowPrompt: "",
          instagramCaption: "",
          status: "draft",
          createdAt: new Date().toLocaleDateString()
        };
      });

      const updatedIdeas = [...newIdeas, ...postIdeas].slice(0, 20);
      setPostIdeas(updatedIdeas);
      localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updatedIdeas));
      showSuccess(`Generadas 5 ideas de la fase ${selectedPhase.toUpperCase()}`);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Error al conectar con la API de DeepSeek.");
    } finally {
      setGeneratingIdeas(false);
    }
  };

  // API Call: Generar prompt estructurado para Flow (con vestuario dinámico)
  const handleGeneratePrompt = async (idea: PostIdea) => {
    if (!isKeyValid(apiKey)) {
      setErrorMsg("Configura tu API Key de DeepSeek.");
      return;
    }
    setGeneratingPrompt(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar: currentAvatar,
          idea: { ...idea, scenePrompt: postPromptInput || idea.scenePrompt },
          apiKey
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setPromptOutput(data.flowPrompt);
      
      const updated = postIdeas.map(item => {
        if (item.id === idea.id) {
          return { 
            ...item, 
            scenePrompt: postPromptInput || item.scenePrompt,
            formattedFlowPrompt: data.flowPrompt 
          };
        }
        return item;
      });
      setPostIdeas(updated);
      localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));
      
      if (selectedIdea?.id === idea.id) {
        setSelectedIdea(prev => prev ? { ...prev, formattedFlowPrompt: data.flowPrompt } : null);
      }
      showSuccess("Prompt de Flow generado.");
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Error al generar el prompt.");
    } finally {
      setGeneratingPrompt(false);
    }
  };

  // API Call: Generar Caption de Instagram
  const handleGenerateCaption = async (idea: PostIdea) => {
    if (!isKeyValid(apiKey)) {
      setErrorMsg("Configura tu API Key de DeepSeek.");
      return;
    }
    setGeneratingCaption(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar: currentAvatar,
          idea: { ...idea, scenePrompt: postPromptInput || idea.scenePrompt },
          apiKey
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setCaptionOutput(data.caption);

      const updated = postIdeas.map(item => {
        if (item.id === idea.id) {
          return { 
            ...item, 
            scenePrompt: postPromptInput || item.scenePrompt,
            instagramCaption: data.caption 
          };
        }
        return item;
      });
      setPostIdeas(updated);
      localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));

      if (selectedIdea?.id === idea.id) {
        setSelectedIdea(prev => prev ? { ...prev, instagramCaption: data.caption } : null);
      }
      showSuccess("Caption de Instagram generado.");
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Error al generar pie de foto.");
    } finally {
      setGeneratingCaption(false);
    }
  };

  // Actualizar información del producto
  const handleUpdateProductInfo = (name: string, image?: string) => {
    if (!selectedIdea) return;
    const updatedIdea: PostIdea = { 
      ...selectedIdea, 
      productName: name,
      ...(image !== undefined ? { productImage: image } : {})
    };
    if (image === null as any) {
      delete updatedIdea.productImage;
    }
    setSelectedIdea(updatedIdea);
    
    const updatedList = postIdeas.map(idea => idea.id === selectedIdea.id ? updatedIdea : idea);
    setPostIdeas(updatedList);
    localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updatedList));
  };

  const handleUploadProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedIdea) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("La imagen del producto no debe superar los 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleUpdateProductInfo(selectedIdea.productName || "", base64String);
        showSuccess("Imagen de producto asociada.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProductImage = () => {
    if (!selectedIdea) return;
    handleUpdateProductInfo(selectedIdea.productName || "", null as any);
  };

  // Seleccionar una idea de post para trabajar
  const handleSelectIdea = (idea: PostIdea) => {
    setSelectedIdea(idea);
    setPostPromptInput(idea.scenePrompt);
    setPromptOutput(idea.formattedFlowPrompt || "");
    setCaptionOutput(idea.instagramCaption || "");
  };

  // Eliminar idea
  const handleDeleteIdea = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = postIdeas.filter(item => item.id !== id);
    setPostIdeas(updated);
    localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));
    if (selectedIdea?.id === id) {
      setSelectedIdea(null);
    }
  };

  // Simulación: Enviar mensaje al Avatar
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !activeSimulationId) return;
    if (!isKeyValid(apiKey)) {
      setErrorMsg("Por favor, ingresa tu API Key de DeepSeek arriba para chatear.");
      setShowApiKeyInput(true);
      return;
    }

    const currentSim = simulations.find(s => s.id === activeSimulationId);
    if (!currentSim) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...currentSim.messages, userMsg];
    const updatedSim: ChatSimulation = { ...currentSim, messages: updatedMessages };
    
    const nextSimulations = simulations.map(s => s.id === activeSimulationId ? updatedSim : s);
    setSimulations(nextSimulations);
    localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(nextSimulations));
    setChatInput("");
    setIsAvatarTyping(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatar: currentAvatar,
          messages: updatedMessages,
          apiKey
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const avatarMsg: ChatMessage = {
        id: `msg_avatar_${Date.now()}`,
        sender: "avatar",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      let newStatus = currentSim.status;
      if (data.reply.includes(currentAvatar.monetizationLink)) {
        newStatus = "converted";
      }

      const finalSim: ChatSimulation = {
        ...updatedSim,
        messages: [...updatedMessages, avatarMsg],
        status: newStatus
      };

      const finalSims = simulations.map(s => s.id === activeSimulationId ? finalSim : s);
      setSimulations(finalSims);
      localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(finalSims));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al obtener respuesta del avatar.");
    } finally {
      setIsAvatarTyping(false);
    }
  };

  // Simulación: Inyectar link de afiliados en el chat
  const handleForceSendLink = () => {
    if (!activeSimulationId) return;
    const currentSim = simulations.find(s => s.id === activeSimulationId);
    if (!currentSim) return;

    const linkMsg: ChatMessage = {
      id: `msg_link_${Date.now()}`,
      sender: "avatar",
      text: `¡Hola de nuevo! Aquí te dejo el enlace de registro que uso para mis inversiones. Si te registras hoy, te regalan un cupo extra y un bono de $20 USD para arrancar de inmediato: ${currentAvatar.monetizationLink} ¡Cualquier consulta me escribes!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const finalSim: ChatSimulation = {
      ...currentSim,
      messages: [...currentSim.messages, linkMsg],
      status: "converted"
    };

    const finalSims = simulations.map(s => s.id === activeSimulationId ? finalSim : s);
    setSimulations(finalSims);
    localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(finalSims));
  };

  // Crear nueva simulación de chat
  const handleCreateNewSim = () => {
    const names = ["camila_ventures", "mateo_inversor", "sofia_nomadgirl", "daniel_libertad"];
    const bios = [
      "25 años. De Santiago. Busca opciones de inversión mínimas porque tiene poco presupuesto.",
      "29 años. De Bogotá. Ingeniero mecánico. Quiere dejar su empleo tradicional pero necesita un colchón financiero.",
      "26 años. De Buenos Aires. Emprendedora. Quiere viajar sola y busca ideas sobre ingresos pasivos digitales.",
      "32 años. De Madrid. Nómada. Quiere saber qué broker o app fintech es más rentable para usar desde varios países."
    ];
    const randIdx = Math.floor(Math.random() * names.length);
    
    const newSim: ChatSimulation = {
      id: `sim_${Date.now()}`,
      avatarId: currentAvatar.id,
      userName: names[randIdx] + "_" + Math.floor(Math.random() * 99),
      userBio: bios[randIdx],
      status: "active",
      messages: [
        { id: `m_${Date.now()}`, sender: "user", text: `Hola! Me encantan tus posts de viaje. ¿Cómo lograste monetizar tu marca personal para viajar sola?`, timestamp: "Justo ahora" }
      ]
    };

    const nextSimulations = [newSim, ...simulations];
    setSimulations(nextSimulations);
    localStorage.setItem(`ugc_simulations_${currentAvatar.id}`, JSON.stringify(nextSimulations));
    setActiveSimulationId(newSim.id);
  };

  // Resetear simulaciones
  const handleResetSims = () => {
    localStorage.removeItem(`ugc_simulations_${currentAvatar.id}`);
    setSimulations([]);
    setActiveSimulationId(null);
  };

  // Obtener los pasos parseados del prompt de la idea seleccionada
  const promptSteps = selectedIdea && promptOutput ? parsePromptSteps(promptOutput, selectedIdea.type) : [];
  const repeatingIngredients = promptOutput ? parseRepeatingIngredients(promptOutput) : "";

  return (
    <div className="relative min-h-screen bg-[#fafafc] text-slate-800 overflow-x-hidden flex flex-col justify-between font-sans">
      
      {/* Fondo decorativo suave (Premium Light Aesthetics) */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-rose-200/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[700px] h-[700px] rounded-full bg-amber-200/20 blur-[150px] pointer-events-none" />

      {/* SUCCESS ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-800"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="relative z-10 border-b border-slate-100 bg-white/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-400 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  UGC Avatar<span className="text-rose-500 font-medium"> Studio</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                  Fase 2
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Gestor de Influencers AI y Embudos de Redes Sociales</p>
            </div>
          </div>

          {/* Selector de Avatar (Multi-Avatar) y API Key */}
          <div className="flex items-center gap-3">
            
            {/* Selector de Avatar */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden md:inline">Avatar Activo:</span>
              <div className="relative flex items-center">
                <select
                  value={selectedAvatarId}
                  onChange={(e) => handleSelectAvatarChange(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold px-3 py-2 pr-8 rounded-xl border border-slate-200/50 focus:outline-none appearance-none cursor-pointer min-w-[140px]"
                >
                  {avatars.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 pointer-events-none text-slate-500 text-[10px]">▼</div>
              </div>
              
              <button
                onClick={() => setShowCreateAvatarModal(true)}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-500 transition-all cursor-pointer flex items-center gap-1.5"
                title="Añadir Avatar de Cliente"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="text-xs font-bold hidden md:inline">Nuevo</span>
              </button>
            </div>

            <span className="h-6 w-px bg-slate-200/70" />

            {isKeyValid(apiKey) ? (
              <button 
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/70 transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                API Conectada
              </button>
            ) : (
              <button 
                onClick={() => setShowApiKeyInput(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100/70 transition-all cursor-pointer animate-pulse"
              >
                <Key className="w-3.5 h-3.5" />
                Falta API Key
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONFIGURADOR DE API KEY */}
      <AnimatePresence>
        {showApiKeyInput && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-20 max-w-xl mx-auto w-full px-6 mt-4"
          >
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xl shadow-slate-200/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-amber-500" />
                Configurar DeepSeek API Key
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Ingresa tu clave de API de DeepSeek para habilitar el planificador de contenido, el setup viral de perfiles y los chats de DMs simulados.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-all cursor-pointer shadow-lg shadow-rose-500/10"
                >
                  Guardar
                </button>
                {apiKey && (
                  <button
                    onClick={handleClearApiKey}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENSAJES DE ERROR */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto w-full px-6 mt-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs sm:text-sm">
            {errorMsg}
          </div>
        </div>
      )}

      {/* DASHBOARD GRID */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* NAVEGACIÓN Y PERFIL DE AVATAR */}
        <section className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Card Resumen de Identidad del Avatar */}
          <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col items-center text-center shadow-lg shadow-slate-100/50 relative overflow-hidden group">
            
            {/* Foto de Perfil con subida interactiva */}
            <div className="relative w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-rose-400 to-amber-400 mb-4 shadow-md group/photo">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {currentAvatar.avatarImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={currentAvatar.avatarImage} 
                    alt={currentAvatar.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-3xl font-extrabold tracking-widest text-rose-400 bg-clip-text text-transparent bg-gradient-to-tr from-rose-500 to-amber-400">
                    {currentAvatar.name.split(" ").map(n => n[0]).join("")}
                  </span>
                )}
                
                {/* Overlay para editar foto */}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                </label>
              </div>

              {currentAvatar.avatarImage && (
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-1 -right-1 p-1 rounded-full bg-red-100 hover:bg-red-200 border border-red-200 text-red-500 shadow transition-all cursor-pointer"
                  title="Eliminar foto"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <h3 className="text-base font-extrabold text-slate-800 leading-tight flex items-center gap-1.5 justify-center">
              {currentAvatar.name}
            </h3>
            
            <div className="flex gap-1.5 items-center mt-1">
              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {currentAvatar.age} Años
              </span>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                UGC Influencer
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-3.5 line-clamp-3 leading-relaxed">
              {currentAvatar.backstory}
            </p>

            <div className="w-full border-t border-slate-100 my-4" />

            {/* Producto de afiliado actual */}
            <div className="w-full text-left">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Afiliado Fintech</span>
              <a 
                href={currentAvatar.monetizationLink} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between text-xs text-amber-600 font-semibold hover:underline mt-0.5"
              >
                <span className="truncate max-w-[170px]">{currentAvatar.monetizationProduct}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Menú de pestañas */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-2 flex flex-col gap-1 shadow-md shadow-slate-100/50">
            <button
              onClick={() => setActiveTab("identity")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "identity" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <User className="w-4 h-4 text-rose-500" />
              Identidad & DNA
            </button>
            <button
              onClick={() => setActiveTab("setup")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "setup" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <Award className="w-4 h-4 text-rose-400" />
              Setup Viral Perfiles
            </button>
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "planner" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              Planificador en Fases
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "chat" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <MessageCircle className="w-4 h-4 text-yellow-500" />
              Simulador de DMs
            </button>
            <button
              onClick={() => setActiveTab("metrics")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "metrics" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
            >
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Embudo Financiero
            </button>
          </div>
          
          {avatars.length > 1 && (
            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-center">
              <p className="text-[10px] text-slate-500">
                Estás gestionando un portafolio de <strong>{avatars.length} avatares</strong>.
              </p>
            </div>
          )}
        </section>

        {/* CONTENEDOR CENTRAL DINÁMICO */}
        <section className="lg:col-span-3 flex flex-col justify-stretch">
          
          <AnimatePresence mode="wait">
            
            {/* PESTAÑA 1: CEREBRO Y DNA DEL AVATAR */}
            {activeTab === "identity" && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-6 h-full"
              >
                <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-lg shadow-slate-100/50">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <User className="w-5 h-5 text-rose-500" />
                          Configuración del Cerebro de la Modelo AI
                        </h2>
                        <p className="text-xs text-slate-500">Configura la psicología, tono de voz y el DNA del avatar seleccionado.</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {currentAvatar.id !== "valeria_cruz" && (
                          <button
                            onClick={(e) => handleDeleteAvatar(currentAvatar.id, e)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer"
                          >
                            Eliminar Cliente
                          </button>
                        )}
                        {!isEditingIdentity ? (
                          <button
                            onClick={() => setIsEditingIdentity(true)}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200/50 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer"
                          >
                            Editar Perfil
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setIsEditingIdentity(false);
                                const savedList = localStorage.getItem("ugc_multi_avatars_list");
                                if (savedList) {
                                  const list = JSON.parse(savedList);
                                  const found = list.find((a: any) => a.id === currentAvatar.id);
                                  if (found) setCurrentAvatar(found);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSaveIdentity}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all cursor-pointer"
                            >
                              Guardar Cambios
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Formulario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Lado Izquierdo: Biográficos */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Nombre de la Modelo</label>
                          <input
                            type="text"
                            value={currentAvatar.name}
                            onChange={(e) => setCurrentAvatar({ ...currentAvatar, name: e.target.value })}
                            disabled={!isEditingIdentity}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none disabled:opacity-60 transition-all font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Edad</label>
                            <input
                              type="number"
                              value={currentAvatar.age}
                              onChange={(e) => setCurrentAvatar({ ...currentAvatar, age: parseInt(e.target.value) || 25 })}
                              disabled={!isEditingIdentity}
                              className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none disabled:opacity-60 transition-all font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">{"Nicho / Especialidad"}</label>
                            <input
                              type="text"
                              value={currentAvatar.niche}
                              onChange={(e) => setCurrentAvatar({ ...currentAvatar, niche: e.target.value })}
                              disabled={!isEditingIdentity}
                              className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none disabled:opacity-60 transition-all font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">{"Historia de Origen / Backstory"}</label>
                          <textarea
                            value={currentAvatar.backstory}
                            onChange={(e) => setCurrentAvatar({ ...currentAvatar, backstory: e.target.value })}
                            disabled={!isEditingIdentity}
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60 resize-none leading-relaxed transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Producto de Monetización</label>
                            <input
                              type="text"
                              value={currentAvatar.monetizationProduct}
                              onChange={(e) => setCurrentAvatar({ ...currentAvatar, monetizationProduct: e.target.value })}
                              disabled={!isEditingIdentity}
                              className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none disabled:opacity-60 transition-all font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Link de Destino</label>
                            <input
                              type="text"
                              value={currentAvatar.monetizationLink}
                              onChange={(e) => setCurrentAvatar({ ...currentAvatar, monetizationLink: e.target.value })}
                              disabled={!isEditingIdentity}
                              className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-amber-600 font-semibold focus:outline-none disabled:opacity-60 transition-all font-semibold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lado Derecho: DNA y Voz para Flow */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center justify-between">
                            <span>Character DNA (Físico Fijo en Flow)</span>
                            <button 
                              onClick={() => triggerCopy(currentAvatar.characterDna, "dna")}
                              className="text-[9px] text-slate-400 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer font-semibold"
                            >
                              {copiedText === "dna" ? "¡Copiado!" : "Copiar"}
                            </button>
                          </label>
                          <textarea
                            value={currentAvatar.characterDna}
                            onChange={(e) => setCurrentAvatar({ ...currentAvatar, characterDna: e.target.value })}
                            disabled={!isEditingIdentity}
                            rows={3}
                            className="w-full bg-slate-100 border border-slate-200/50 focus:border-rose-300 rounded-xl px-4 py-2 text-xs text-slate-700 font-mono focus:outline-none disabled:opacity-65 resize-none leading-relaxed transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center justify-between">
                            <span>Audio Settings (Voz en Flow)</span>
                            <button 
                              onClick={() => triggerCopy(currentAvatar.audioSettings, "audio")}
                              className="text-[9px] text-slate-400 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer font-semibold"
                            >
                              {copiedText === "audio" ? "¡Copiado!" : "Copiar"}
                            </button>
                          </label>
                          <textarea
                            value={currentAvatar.audioSettings}
                            onChange={(e) => setCurrentAvatar({ ...currentAvatar, audioSettings: e.target.value })}
                            disabled={!isEditingIdentity}
                            rows={3}
                            className="w-full bg-slate-100 border border-slate-200/50 focus:border-rose-300 rounded-xl px-4 py-2 text-xs text-slate-700 font-mono focus:outline-none disabled:opacity-65 resize-none leading-relaxed transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-yellow-600 uppercase tracking-wider flex items-center justify-between">
                            <span>Video Performance (Gestos en Flow)</span>
                            <button 
                              onClick={() => triggerCopy(currentAvatar.videoSettings, "video")}
                              className="text-[9px] text-slate-400 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer font-semibold"
                            >
                              {copiedText === "video" ? "¡Copiado!" : "Copiar"}
                            </button>
                          </label>
                          <textarea
                            value={currentAvatar.videoSettings}
                            onChange={(e) => setCurrentAvatar({ ...currentAvatar, videoSettings: e.target.value })}
                            disabled={!isEditingIdentity}
                            rows={3}
                            className="w-full bg-slate-100 border border-slate-200/50 focus:border-rose-300 rounded-xl px-4 py-2 text-xs text-slate-700 font-mono focus:outline-none disabled:opacity-65 resize-none leading-relaxed transition-all"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Sección Informativa */}
                  <div className="mt-6 p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex items-center gap-3">
                    <Award className="w-8 h-8 text-rose-500 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Marca Personal e Influencer UGC Consistente</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        Este panel resguarda la información del avatar. El Character DNA, la configuración de voz y de video deben copiarse directamente en la plataforma **Flow de Gemini** para mantener la consistencia física y auditiva en cada creación de post o video.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTAÑA 2: SETUP DE CUENTA VIRAL */}
            {activeTab === "setup" && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-6 h-full"
              >
                <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-lg shadow-slate-100/50">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Award className="w-5 h-5 text-rose-500" />
                          Módulo de Setup Viral (Instagram & TikTok)
                        </h2>
                        <p className="text-xs text-slate-500">Crea el perfil profesional perfecto desde cero para que el algoritmo impulse al avatar rápidamente.</p>
                      </div>

                      <button
                        onClick={handleGetSetupData}
                        disabled={generatingSetup}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/10"
                      >
                        {generatingSetup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Generar Plan de Setup
                      </button>
                    </div>

                    {setupData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Nombres de usuario y Biografía */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">Nombres de Usuario Recomendados (Disponibilidad SEO)</span>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {setupData.usernames.map((u, i) => (
                                <button
                                  key={i}
                                  onClick={() => triggerCopy(u, `usr_${i}`)}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/50 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  {u}
                                  {copiedText === `usr_${i}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">Biografías Magnéticas (Ganchos de Conversión)</span>
                            <div className="mt-2.5 space-y-3">
                              {setupData.bios.map((b, i) => (
                                <div key={i} className="bg-white p-3 rounded-xl border border-slate-200/30 relative group">
                                  <pre className="text-xs text-slate-700 font-sans whitespace-pre-line leading-relaxed">{b}</pre>
                                  <button
                                    onClick={() => triggerCopy(b, `bio_${i}`)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                                    title="Copiar biografía"
                                  >
                                    {copiedText === `bio_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Plan de Grid Inicial y Tips Algorítmicos */}
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Primeros 3 Posts Fijos Anclados (Feed Setup)</span>
                            <div className="mt-2.5 space-y-2">
                              {setupData.gridPlan.map((p, i) => (
                                <div key={i} className="flex gap-2 items-start bg-white p-3 rounded-xl border border-slate-200/30">
                                  <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <p className="text-xs text-slate-700 leading-normal">{p}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Estrategias SEO y Algoritmo para Cuentas Nuevas</span>
                            <div className="mt-2.5 space-y-2">
                              {setupData.seoTips.map((t, i) => (
                                <div key={i} className="flex gap-2 items-start bg-white p-3 rounded-xl border border-slate-200/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                  <p className="text-xs text-slate-600 leading-normal">{t}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-10 py-16 border border-dashed border-slate-200 rounded-3xl">
                        <Smartphone className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-700">El plan no se ha configurado</h4>
                        <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                          Haz clic en **"Generar Plan de Setup"** para que DeepSeek analice el nicho de {currentAvatar.name} y te diseñe los usernames, bios magnéticas y el feed inicial perfecto.
                        </p>
                      </div>
                    )}

                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Importancia de la Optimización Inicial</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        Instagram y TikTok otorgan un "boost inicial" de visibilidad a los perfiles recién creados para calentar la cuenta. Configurar una biografía clara con SEO (palabras clave del nicho) y anclar los posts biográficos correctos multiplicará tu conversión de seguidores el primer mes.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PESTAÑA 3: PLANIFICADOR DE CONTENIDO EN FASES */}
            {activeTab === "planner" && (
              <motion.div
                key="planner"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch h-full"
              >
                {/* Lista de Ideas generadas (2 columnas) */}
                <div className="md:col-span-2 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
                  <div>
                    
                    {/* Selector de fase */}
                    <div className="mb-4">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Fase de Crecimiento para Contenido</span>
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                        {(["storytelling", "value", "conversion"] as const).map(p => (
                          <button
                            key={p}
                            onClick={() => setSelectedPhase(p)}
                            className={`py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${selectedPhase === p ? "bg-white text-rose-500 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800"}`}
                          >
                            {p === "storytelling" ? "Fase 1" : p === "value" ? "Fase 2" : "Fase 3"}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1.5 leading-normal">
                        {selectedPhase === "storytelling" ? "Storytelling y empatía (viajes y pasado de deudas). Cero ventas." :
                         selectedPhase === "value" ? "Consejos de finanzas prácticos y lifestyle sin enlaces comerciales." :
                         "Conversión agresiva (Comenta y te envío el bono de $20 USD)."}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-800">Ideas Planificadas</span>
                      <button
                        onClick={handleGenerateIdeas}
                        disabled={generatingIdeas}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold shadow-md shadow-rose-500/10"
                      >
                        {generatingIdeas ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Generar {selectedPhase === "storytelling" ? "Fase 1" : selectedPhase === "value" ? "Fase 2" : "Fase 3"}
                      </button>
                    </div>

                    {/* Lista Scrolleable */}
                    <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1.5 no-scrollbar">
                      {postIdeas.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white/20">
                          <Calendar className="w-8 h-8 mx-auto mb-1 opacity-20" />
                          <p className="text-[10px] max-w-[170px] mx-auto leading-relaxed">No hay posts. Genera ideas en la fase elegida para iniciar la secuencia de Valeria Cruz.</p>
                        </div>
                      ) : (
                        postIdeas.map((idea) => (
                          <div
                            key={idea.id}
                            onClick={() => handleSelectIdea(idea)}
                            className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between gap-1 group ${selectedIdea?.id === idea.id ? "bg-rose-50 border-rose-300" : "bg-white border-slate-200/40 hover:bg-slate-50 hover:border-slate-300"}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-1.5">
                                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${idea.phase === "storytelling" ? "bg-blue-50 text-blue-500 border border-blue-100" : idea.phase === "value" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-rose-50 text-rose-500 border border-rose-100"}`}>
                                  {idea.phase === "storytelling" ? "F1: Story" : idea.phase === "value" ? "F2: Valor" : "F3: Conv"}
                                </span>
                                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${idea.type === "carousel" ? "bg-purple-50 text-purple-600 border border-purple-100" : idea.type === "video" ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                                  {idea.type === "carousel" ? "Carrusel" : idea.type === "video" ? "Video" : "Foto"}
                                </span>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteIdea(idea.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                              >
                                Borrar
                              </button>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-rose-500 transition-colors">
                              {idea.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                              {idea.scenePrompt}
                            </p>
                            <span className="text-[8px] text-slate-400 flex items-center gap-1 font-semibold">
                              <Globe className="w-2.5 h-2.5 text-slate-400" />
                              {idea.location}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 mt-4 text-center border-t border-slate-100 pt-2 leading-relaxed">
                    Valeria Cruz debe usar posts de <strong>Fase 1 y 2</strong> el primer mes para calentar su cuenta nueva antes de pasar a la <strong>Fase 3</strong> de ventas.
                  </p>
                </div>

                {/* Panel de Trabajo de Prompt y Copy (3 columnas) */}
                <div className="md:col-span-3 flex flex-col gap-4">
                  {selectedIdea ? (
                    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 flex flex-col justify-between flex-1 max-h-[620px] overflow-y-auto no-scrollbar shadow-lg shadow-slate-100/50">
                      <div>
                        
                        {/* Cabecera del post */}
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Mesa de Edición</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${selectedIdea.phase === "storytelling" ? "bg-blue-50 text-blue-500" : selectedIdea.phase === "value" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-500"}`}>
                                {selectedIdea.phase === "storytelling" ? "Fase 1: Storytelling" : selectedIdea.phase === "value" ? "Fase 2: Valor" : "Fase 3: Conversión"}
                              </span>
                            </div>
                            <h3 className="text-sm font-extrabold text-slate-900 mt-1">{selectedIdea.title}</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-semibold">
                              <Globe className="w-3 h-3 text-amber-500" />
                              {selectedIdea.location}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[8px] font-black uppercase text-slate-600 border border-slate-200/50">
                            {selectedIdea.type}
                          </span>
                        </div>

                        {/* Modificador del Prompt de Escena */}
                        <div className="mb-4">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Escena Visual & Vestuario Dinámico (Modificable)</label>
                          <textarea
                            value={postPromptInput}
                            onChange={(e) => setPostPromptInput(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed transition-all"
                          />
                        </div>

                        {/* Integración de Producto de Afiliados / Patrocinio */}
                        <div className="mb-4 p-4 bg-slate-50/70 border border-slate-200/40 rounded-2xl">
                          <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-2">{"Integración de Producto / Patrocinio (Opcional)"}</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            
                            {/* Subida de Imagen */}
                            <div className="sm:col-span-1 flex flex-col items-center">
                              <div className="w-14 h-14 rounded-xl border border-dashed border-slate-200 bg-white flex items-center justify-center overflow-hidden relative group/prod shadow-sm">
                                {selectedIdea.productImage ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img 
                                    src={selectedIdea.productImage} 
                                    alt={selectedIdea.productName || "Producto"} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <Upload className="w-4 h-4 text-slate-400" />
                                )}
                                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/prod:opacity-100 transition-opacity cursor-pointer">
                                  <Upload className="w-4 h-4 text-white" />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUploadProductImage}
                                    className="hidden"
                                  />
                                </label>
                                {selectedIdea.productImage && (
                                  <button
                                    onClick={handleRemoveProductImage}
                                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-100 hover:bg-red-200 text-red-500 shadow transition-all cursor-pointer"
                                    title="Remover imagen"
                                  >
                                    <Trash className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[8px] text-slate-400 mt-1 font-semibold">Foto Referencia</span>
                            </div>

                            {/* Nombre del Producto */}
                            <div className="sm:col-span-2">
                              <label className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Nombre Comercial del Producto</label>
                              <input
                                type="text"
                                value={selectedIdea.productName || ""}
                                onChange={(e) => handleUpdateProductInfo(e.target.value)}
                                placeholder="Ej. Tarjeta Fintech Gold o Bebida Energética"
                                className="w-full bg-white border border-slate-200/50 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-300 font-semibold"
                              />
                              <p className="text-[8px] text-slate-400 mt-1 leading-normal">
                                La IA integrará este producto en los prompts de Flow de forma visualmente realista.
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <button
                            onClick={() => handleGeneratePrompt(selectedIdea)}
                            disabled={generatingPrompt}
                            className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            {generatingPrompt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5 text-amber-500" />}
                            Crear Prompt de Flow
                          </button>
                          <button
                            onClick={() => handleGenerateCaption(selectedIdea)}
                            disabled={generatingCaption}
                            className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            {generatingCaption ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5 text-rose-400" />}
                            Generar Copy Instagram
                          </button>
                        </div>

                                  {/* Prompt estructurado de Flow con Vestuario Dinámico */}
                          {promptOutput && (
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                  {selectedIdea.type === "carousel" ? "Prompts de Carrusel Estructurados (Flow de Gemini)" :
                                   selectedIdea.type === "video" ? "Prompts de Video Multitoma Estructurados (Flow de Gemini)" :
                                   "Prompt Estructurado Exclusivo (Copia a Flow de Gemini)"}
                                </span>
                                {promptSteps.length === 0 && (
                                  <button
                                    onClick={() => triggerCopy(promptOutput, "flow_prompt")}
                                    className="text-[9px] text-slate-400 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-bold"
                                  >
                                    {copiedText === "flow_prompt" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    {copiedText === "flow_prompt" ? "¡Copiado!" : "Copiar"}
                                  </button>
                                )}
                              </div>

                              {promptSteps.length > 0 ? (
                                <div className="space-y-3">
                                  {repeatingIngredients && (
                                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/50 text-[10px] text-amber-800 flex items-start gap-2.5 shadow-sm mb-3">
                                      <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                                      <div>
                                        <h4 className="font-bold text-amber-900">{"Ingredientes Fijos Detectados"}</h4>
                                        <p className="text-[9px] text-amber-700 leading-relaxed mt-0.5">
                                          {"Para evitar que los objetos cambien de forma entre fotos/tomas, te sugerimos buscar una imagen única de los siguientes elementos y cargarla como ingrediente de referencia en Flow:"}
                                        </p>
                                        <p className="font-mono bg-white/50 px-2 py-1 rounded border border-amber-100 text-[9px] text-amber-900 mt-2 font-bold inline-block">
                                          {repeatingIngredients}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <p className="text-[9px] text-slate-500 leading-normal mb-2">
                                    Hemos detectado {promptSteps.length} {selectedIdea.type === "carousel" ? "fotos individuales" : "tomas individuales"}. 
                                    Copia y genera el prompt de cada una por separado en Flow de Gemini para mantener continuidad total:
                                  </p>
                                  <div className="grid grid-cols-1 gap-2.5">
                                    {promptSteps.map((step, idx) => {
                                      return (
                                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 relative group flex flex-col justify-between gap-2 shadow-inner">
                                          <div className="flex justify-between items-center">
                                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-wider">
                                              {step.label}
                                            </span>
                                            <button
                                              onClick={() => triggerCopy(step.fullText, `flow_step_${idx}`)}
                                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[9px] text-slate-200 font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/5"
                                            >
                                              {copiedText === `flow_step_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 animate-pulse" />}
                                              {copiedText === `flow_step_${idx}` ? "¡Copiado!" : `Copiar Prompt Completo ${step.label}`}
                                            </button>
                                          </div>
                                          
                                          {/* Vista preliminar del fragmento de escena */}
                                          <div className="text-[9.5px] text-slate-400 font-sans italic leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800 select-all max-h-[80px] overflow-y-auto no-scrollbar">
                                            {step.text}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <textarea
                                  readOnly
                                  value={promptOutput}
                                  rows={6}
                                  className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-[10px] text-slate-200 font-mono focus:outline-none resize-none leading-relaxed no-scrollbar"
                                />
                              )}
                              <p className="text-[9px] text-slate-400 mt-2.5 leading-normal font-medium">
                                *Nota: La sección DYNAMIC SCENE de arriba viste dinámicamente al avatar {currentAvatar.name} de acuerdo a su entorno.
                              </p>
                            </div>
                          )}

                          {/* Copy de Instagram */}
                          {captionOutput && (
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                                   {"Copy / Caption de Instagram"}
                                  {selectedIdea.phase === "conversion" && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase">Monetiza</span>
                                  )}
                                </span>
                                <button
                                  onClick={() => triggerCopy(captionOutput, "insta_caption")}
                                  className="text-[9px] text-slate-400 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-bold"
                                >
                                  {copiedText === "insta_caption" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                  {copiedText === "insta_caption" ? "¡Copiado!" : "Copiar"}
                                </button>
                              </div>
                              <textarea
                                readOnly
                                value={captionOutput}
                                rows={6}
                                className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-4 py-3 text-xs text-slate-700 leading-relaxed focus:outline-none resize-none no-scrollbar"
                              />
                            </div>
                          )}

                        </div>

                      </div>
                  ) : (
                    <div className="bg-white/40 border border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center flex-1 min-h-[400px]">
                      <Calendar className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                      <h4 className="text-sm font-bold text-slate-700">Ningún Post Seleccionado</h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                        Selecciona un post de la izquierda para estructurar sus directrices de vestuario y generar el copy acorde a su fase actual.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* PESTAÑA 4: SIMULADOR DE DMs */}
            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch h-full"
              >
                {/* Listado de Chats Simulados (1 columna) */}
                <div className="md:col-span-1 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-4 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
                  <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                      <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Chats de DMs</h3>
                        <p className="text-[8px] text-slate-400">Embudo conversacional</p>
                      </div>
                      <button
                        onClick={handleCreateNewSim}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200/50 text-slate-800 cursor-pointer font-bold text-xs"
                        title="Nueva simulación de seguidor"
                      >
                        +
                      </button>
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[440px] pr-1 no-scrollbar">
                      {simulations.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-10">No hay chats activos. Crea uno nuevo arriba.</p>
                      ) : (
                        simulations.map(sim => (
                          <button
                            key={sim.id}
                            onClick={() => setActiveSimulationId(sim.id)}
                            className={`w-full p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${activeSimulationId === sim.id ? "bg-rose-50 border-rose-200 shadow-sm" : "bg-white/10 border-transparent hover:bg-slate-50/70"}`}
                          >
                            <span className="text-xs font-bold text-slate-800 flex items-center justify-between">
                              @{sim.userName}
                              {sim.status === "converted" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Convertido (Clic en enlace)" />
                              )}
                            </span>
                            <span className="text-[9px] text-slate-500 line-clamp-1 leading-normal">
                              {sim.messages[sim.messages.length - 1]?.text || "Sin mensajes"}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleResetSims}
                    className="w-full py-2 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 text-[9px] font-bold uppercase transition-all cursor-pointer"
                  >
                    Resetear Chats
                  </button>
                </div>

                {/* Caja de Chat y Contexto del Seguidor (3 columnas) */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                  
                  {/* Chat (2 columnas del subgrid) */}
                  <div className="md:col-span-2 bg-white border border-slate-200/50 rounded-3xl flex flex-col justify-between max-h-[620px] relative overflow-hidden shadow-lg shadow-slate-100/50">
                    
                    {/* Cabecera del Chat */}
                    {activeSimulationId ? (
                      (() => {
                        const sim = simulations.find(s => s.id === activeSimulationId);
                        return (
                          <>
                            <div className="px-5 py-3.5 border-b border-slate-100 bg-white/80 backdrop-blur flex justify-between items-center z-10">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 uppercase">
                                  {sim?.userName[0]}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800">@{sim?.userName}</h4>
                                  <span className="text-[9px] text-emerald-600 font-semibold">Interactuando con {currentAvatar.name}</span>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${sim?.status === "converted" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                {sim?.status === "converted" ? "Convertido" : "Embudo Activo"}
                              </span>
                            </div>

                            {/* Área de Mensajes */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px] no-scrollbar">
                              {sim?.messages.map((msg) => (
                                <div 
                                  key={msg.id} 
                                  className={`flex flex-col max-w-[80%] ${msg.sender === "avatar" ? "self-start items-start" : "self-end items-end ml-auto"}`}
                                >
                                  <div className="flex items-center gap-2">
                                    {msg.sender === "avatar" && (
                                      <div className="w-5 h-5 rounded-full bg-rose-400 overflow-hidden flex-shrink-0">
                                        {currentAvatar.avatarImage ? (
                                          /* eslint-disable-next-line */
                                          <img src={currentAvatar.avatarImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="text-[8px] text-white font-bold flex items-center justify-center h-full uppercase">{currentAvatar.name[0]}</span>
                                        )}
                                      </div>
                                    )}
                                    <div 
                                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.sender === "avatar" ? "bg-slate-100 text-slate-800 rounded-tl-sm" : "bg-gradient-to-tr from-rose-400 to-amber-500 text-white rounded-tr-sm"}`}
                                    >
                                      {msg.text}
                                    </div>
                                  </div>
                                  <span className="text-[7px] text-slate-400 mt-1 px-8">{msg.timestamp}</span>
                                </div>
                              ))}

                              {/* Indicador de Escritura del Avatar */}
                              {isAvatarTyping && (
                                <div className="flex flex-col self-start items-start max-w-[80%]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-rose-400 overflow-hidden flex-shrink-0">
                                      {currentAvatar.avatarImage ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={currentAvatar.avatarImage} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-[8px] text-white font-bold flex items-center justify-center h-full uppercase">{currentAvatar.name[0]}</span>
                                      )}
                                    </div>
                                    <div className="px-3.5 py-2.5 rounded-2xl bg-slate-100 text-slate-500 text-xs rounded-tl-sm flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                      <span className="text-[10px] text-slate-400 font-semibold">{currentAvatar.name} está pensando...</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div ref={chatEndRef} />
                            </div>

                            {/* Entrada de Mensajes */}
                            <div className="p-4 border-t border-slate-100 bg-white flex gap-2">
                              <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                                placeholder={`Simula ser el seguidor y chatea con ${currentAvatar.name}...`}
                                className="flex-1 bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                              />
                              <button
                                onClick={handleSendChatMessage}
                                disabled={!chatInput.trim()}
                                className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-400 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white transition-all cursor-pointer flex items-center justify-center shadow-md shadow-rose-500/10"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 flex-1 min-h-[400px]">
                        <MessageCircle className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-700">Ningún Chat Seleccionado</h4>
                        <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                          Selecciona un lead de la izquierda para simular el embudo conversacional.
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Ficha de Contexto del Lead (1 columna del subgrid) */}
                  <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
                    {activeSimulationId ? (
                      (() => {
                        const sim = simulations.find(s => s.id === activeSimulationId);
                        return (
                          <>
                            <div className="space-y-4">
                              <div>
                                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">Perfil del Seguidor</span>
                                <h4 className="text-xs font-bold text-slate-900 mt-0.5">@{sim?.userName}</h4>
                              </div>

                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{"Backstory / Intereses"}</span>
                                <p className="text-xs text-slate-600 leading-relaxed mt-1">{sim?.userBio}</p>
                              </div>

                              <div className="border-t border-slate-100 pt-3">
                                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Fases del Embudo DM</span>
                                <div className="mt-2 space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500 font-semibold">1. Conexión & Charla</span>
                                    <span className="text-emerald-600 font-bold">Hecho</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500 font-semibold">2. Encontrar necesidad</span>
                                    <span className="text-emerald-600 font-bold">Hecho</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500 font-semibold">3. Enlace (Fintech)</span>
                                    <span className={sim?.status === "converted" ? "text-emerald-600 font-bold" : "text-amber-500 font-bold animate-pulse"}>
                                      {sim?.status === "converted" ? "Convertido" : "Pendiente"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100">
                              <button
                                onClick={handleForceSendLink}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/10"
                              >
                                <Wallet className="w-4 h-4" />
                                Enviar Link de Ventas
                              </button>
                              <p className="text-[8px] text-slate-400 text-center leading-normal">
                                Envía de forma forzada el enlace de afiliado de {currentAvatar.name} en el chat.
                              </p>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <div className="text-center py-20 text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-15 animate-pulse" />
                        <p className="text-[10px]">Selecciona un chat activo para ver su perfil.</p>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* PESTAÑA 5: MÉTRICAS FINANCIERAS */}
            {activeTab === "metrics" && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-6 h-full"
              >
                <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-lg shadow-slate-100/50">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      Embudo Financiero & Casos de Estudio de Monetización
                    </h2>
                    <p className="text-xs text-slate-500 mb-6">Muestra métricas reales simuladas a tus clientes potenciales para venderles la creación de sus avatares AI.</p>

                    {/* Fila de Métricas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Seguidores Estimados</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-2xl font-black text-slate-800">42.3k</span>
                          <span className="text-[10px] text-emerald-500 font-bold">+12%</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Clicks Totales DMs</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-2xl font-black text-slate-800">3,124</span>
                          <span className="text-[10px] text-emerald-500 font-bold">+8.4%</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Registros (Broker)</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-2xl font-black text-slate-800">412</span>
                          <span className="text-[10px] text-emerald-500 font-bold">13.2% Conv</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-left">
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Comisión Mensual (Neto)</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-2xl font-black text-emerald-600">$8,240 USD</span>
                          <span className="text-[10px] text-emerald-500 font-bold">Activo</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabla de Conversiones */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-800">Registro de Conversiones Automatizadas en DMs</h4>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-[9px] text-emerald-600 font-bold uppercase">En vivo</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-[9px] uppercase">
                              <th className="p-3">Seguidor</th>
                              <th className="p-3">Nacionalidad</th>
                              <th className="p-3">Acción Conversacional</th>
                              <th className="p-3">Comisión Ganada</th>
                              <th className="p-3 text-right">Tiempo</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-3 text-slate-800 font-semibold">@sofia_travels</td>
                              <td className="p-3 text-slate-500">Buenos Aires</td>
                              <td className="p-3 text-emerald-600 font-semibold">Registro de Cuenta + Fondeo</td>
                              <td className="p-3 text-slate-800 font-bold">$20.00 USD</td>
                              <td className="p-3 text-slate-400 text-right">Hace 15 min</td>
                            </tr>
                            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-3 text-slate-800 font-semibold">@marcos_fintech</td>
                              <td className="p-3 text-slate-500">Santiago</td>
                              <td className="p-3 text-emerald-600 font-semibold">Apertura de Cuenta Premium</td>
                              <td className="p-3 text-slate-800 font-bold">$20.00 USD</td>
                              <td className="p-3 text-slate-400 text-right">Hace 1 hora</td>
                            </tr>
                            <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                              <td className="p-3 text-slate-800 font-semibold">@mariana_finanzas</td>
                              <td className="p-3 text-slate-500">Bogotá</td>
                              <td className="p-3 text-emerald-600 font-semibold">Registro Exitoso desde DM</td>
                              <td className="p-3 text-slate-800 font-bold">$20.00 USD</td>
                              <td className="p-3 text-slate-400 text-right">Hace 2 horas</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* Sección Informativa Comercial */}
                  <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/50">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-rose-500" />
                      Estrategia de Ventas B2B (Servicio de Agencia)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      El avatar de **Valeria Cruz** es tu muestra en vivo de que el ecosistema funciona de forma rentable. Cuando prospectes clientes (coaches, marcas personales o empresas fintech), muéstrales este dashboard. Enséñales cómo Valeria planifica en base a fases su contenido, genera prompts consistentes con vestuario dinámico para la plataforma Flow de Gemini, y cierra conversiones respondiendo DMs automáticamente en español sin intervención humana.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-100 bg-white/70 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            &copy; {new Date().getFullYear()} UGC Avatar Studio. Desarrollado en Modo Claro Premium.
          </div>
          <div className="flex gap-4 font-semibold text-slate-400">
            <span>Proyecto: Ecosistema Valeria Cruz & Clientes</span>
            <span>|</span>
            <span>Flow-Optimized API</span>
          </div>
        </div>
      </footer>

      {/* MODAL PARA CREAR NUEVO AVATAR (CLIENTE) */}
      <AnimatePresence>
        {showCreateAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <UserPlus className="w-5 h-5 text-rose-500" />
                    Crear Avatar de Cliente (Servicio de Agencia)
                  </h3>
                  <p className="text-xs text-slate-500">Configura la identidad base para un nuevo influencer de IA.</p>
                </div>
                <button
                  onClick={() => setShowCreateAvatarModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-xs"
                >
                  Cerrar
                </button>
              </div>

              {/* Formulario Modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={newAvatarForm.name}
                    onChange={(e) => setNewAvatarForm({ ...newAvatarForm, name: e.target.value })}
                    placeholder="Ej. Valeria Cruz"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Edad</label>
                    <input
                      type="number"
                      value={newAvatarForm.age}
                      onChange={(e) => setNewAvatarForm({ ...newAvatarForm, age: parseInt(e.target.value) || 25 })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={newAvatarForm.location}
                      onChange={(e) => setNewAvatarForm({ ...newAvatarForm, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{"Historia del Personaje / Backstory"}</label>
                  <textarea
                    value={newAvatarForm.backstory}
                    onChange={(e) => setNewAvatarForm({ ...newAvatarForm, backstory: e.target.value })}
                    placeholder="Describe los dolores pasados, la transformación y el objetivo del avatar..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{"Nicho / Ángulo"}</label>
                  <input
                    type="text"
                    value={newAvatarForm.niche}
                    onChange={(e) => setNewAvatarForm({ ...newAvatarForm, niche: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Prod. Monetizar</label>
                    <input
                      type="text"
                      value={newAvatarForm.monetizationProduct}
                      onChange={(e) => setNewAvatarForm({ ...newAvatarForm, monetizationProduct: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Link Afiliado</label>
                    <input
                      type="text"
                      value={newAvatarForm.monetizationLink}
                      onChange={(e) => setNewAvatarForm({ ...newAvatarForm, monetizationLink: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Character DNA (Físico en Flow)</label>
                  <textarea
                    value={newAvatarForm.characterDna}
                    onChange={(e) => setNewAvatarForm({ ...newAvatarForm, characterDna: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-mono focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setShowCreateAvatarModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateAvatar}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-md shadow-rose-500/10"
                >
                  Crear e Iniciar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
