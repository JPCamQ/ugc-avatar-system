const { PrismaClient } = eval('require')("@prisma/client");

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Inicialización perezosa (Lazy) mediante un Proxy de JavaScript.
// Esto previene que PrismaClient intente validar el motor de conexión o conectarse
// en frío durante la fase de compilación de Next.js (next build) en local,
// instanciándolo únicamente bajo demanda cuando se realiza una consulta en runtime real.
const getPrismaClient = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
};

export const prisma = new Proxy({} as any, {
  get(target, prop) {
    const client = getPrismaClient();
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export { PrismaClient };
export type { Avatar, PostIdea, ChatSimulation, ChatMessage, AccountSetup } from "@prisma/client";
