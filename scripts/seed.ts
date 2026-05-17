import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });

// ─── World Map ────────────────────────────────────────────────────────────────

const LOCATIONS = [
  {
    slug: "torre-dados",
    name: "Torre de Dados",
    subtitle: "Data Spire",
    description: "O centro nevrálgico da rede digital de Nova Kyros. Sinais, logs e segredos convergem aqui.",
    imageUrl: "/imagens-locais/torre_dados_detalhe.png",
    iconUrl: "/imagens-locais/torre_dados_icone.png",
    mapX: "0.2000",
    mapY: "0.2800",
    isStartHub: false,
  },
  {
    slug: "mercado-neon",
    name: "Mercado de Néon",
    subtitle: "Neon Bazaar",
    description: "Onde informações, hardware e segredos são trocados. Todo crime tem uma trilha aqui.",
    imageUrl: "/imagens-locais/mercado_neon_detalhe.png",
    iconUrl: "/imagens-locais/mercado_neon_icone.png",
    mapX: "0.1500",
    mapY: "0.6500",
    isStartHub: false,
  },
  {
    slug: "docas-silicio",
    name: "Docas de Silício",
    subtitle: "Silicon Docks",
    description: "Ponto de entrada de contrabando digital. Itens proibidos chegam e saem sem registro.",
    imageUrl: "/imagens-locais/docas_silicio_detalhe.png",
    iconUrl: "/imagens-locais/docas_silicio_icone.png",
    mapX: "0.8500",
    mapY: "0.6500",
    isStartHub: false,
  },
  {
    slug: "terminal-subterraneo",
    name: "Terminal Subterrâneo",
    subtitle: "The Undergrid",
    description: "A rede de túneis de serviço esquecida. Onde os sistemas que ninguém admite existir são operados.",
    imageUrl: "/imagens-locais/terminal_subterraneo_detalhe.png",
    iconUrl: "/imagens-locais/terminal_subterraneo_icone.png",
    mapX: "0.5000",
    mapY: "0.5000",
    isStartHub: false,
  },
  {
    slug: "catedral-codigo",
    name: "Catedral do Código",
    subtitle: "Code Cathedral",
    description: "Um antigo centro de processamento convertido em arquivo sagrado. Décadas de dados guardados aqui.",
    imageUrl: "/imagens-locais/catedral_codigo_detalhe.png",
    iconUrl: "/imagens-locais/catedral_codigo_icone.png",
    mapX: "0.8000",
    mapY: "0.2800",
    isStartHub: false,
  },
  {
    slug: "observatorio-zenite",
    name: "Observatório Zenite",
    subtitle: "Zenith Observatory",
    description: "O ponto mais alto de Nova Kyros. Usado para interceptação de sinais e vigilância total.",
    imageUrl: "/imagens-locais/observatorio_zenite_detalhe.png",
    iconUrl: "/imagens-locais/observatorio_zenite_icone.png",
    mapX: "0.5000",
    mapY: "0.0800",
    isStartHub: false,
  },
  {
    slug: "beco-cifras",
    name: "Beco das Cifras",
    subtitle: "Cipher Alley",
    description: "O local onde o crime começou. Todo caso nasce neste beco mal iluminado do Setor 7.",
    imageUrl: "/imagens-locais/beco_cifras_detalhe.png",
    iconUrl: "/imagens-locais/beco_cifras_icone.png",
    mapX: "0.5000",
    mapY: "0.8800",
    isStartHub: true,
  },
] as const;

// Fixed world connections (bidirectional graph)
const CONNECTIONS: Array<{ from: string; to: string; transport: "drone" | "hyperloop" | "magrail" }> = [
  // Beco das Cifras hub
  { from: "beco-cifras", to: "terminal-subterraneo", transport: "magrail" },
  { from: "beco-cifras", to: "mercado-neon", transport: "drone" },
  { from: "beco-cifras", to: "docas-silicio", transport: "drone" },
  // Terminal Subterrâneo central connections
  { from: "terminal-subterraneo", to: "torre-dados", transport: "hyperloop" },
  { from: "terminal-subterraneo", to: "catedral-codigo", transport: "hyperloop" },
  { from: "terminal-subterraneo", to: "observatorio-zenite", transport: "hyperloop" },
  // Upper connections
  { from: "torre-dados", to: "mercado-neon", transport: "drone" },
  { from: "torre-dados", to: "observatorio-zenite", transport: "drone" },
  { from: "catedral-codigo", to: "docas-silicio", transport: "drone" },
  { from: "catedral-codigo", to: "observatorio-zenite", transport: "drone" },
  // Lower cross
  { from: "mercado-neon", to: "docas-silicio", transport: "magrail" },
];

// ─── Characters ───────────────────────────────────────────────────────────────

const CHARACTERS = [
  {
    slug: "kaito-nakamura",
    name: "Kaito Nakamura",
    codename: "Ghost",
    specialty: "Infiltração Digital",
    personality: "Calmo, Lógico e Leal",
    description: "Especialista em penetrar sistemas sem deixar rastro. Kaito opera nas sombras digitais com precisão cirúrgica — quando ele esteve num servidor, você só descobre depois.",
    avatarUrl: "/imagens-personagens/kaito_avatar_v2.png",
    portraitUrl: "/imagens-personagens/kaito_portrait_v2.png",
  },
  {
    slug: "anya-petrova",
    name: "Anya Petrova",
    codename: "Oracle",
    specialty: "Análise de Dados",
    personality: "Intuitiva e Perspicaz",
    description: "Ela vê padrões onde outros veem ruído. Ex-analista da Agência Névoa, Anya processa informações com uma velocidade que parece sobrenatural — porque quase é.",
    avatarUrl: "/imagens-personagens/anya_avatar_v2.png",
    portraitUrl: "/imagens-personagens/anya_portrait_v2.png",
  },
  {
    slug: "jax-thorne",
    name: "Jax Thorne",
    codename: "Rivet",
    specialty: "Infraestrutura Física",
    personality: "Prático e Cínico",
    description: "Enquanto os outros olham para as telas, Jax olha para os canos, cabos e paredes. Conhece cada esquina física de Nova Kyros e não tem paciência para teorias não testadas.",
    avatarUrl: "/imagens-personagens/jax_avatar_v2.png",
    portraitUrl: "/imagens-personagens/jax_portrait_v2.png",
  },
  {
    slug: "lena-volkov",
    name: "Lena Volkov",
    codename: "Echo",
    specialty: "Engenharia Social",
    personality: "Carismática e Adaptável",
    description: "Toda testemunha conta mais para Lena do que para qualquer outro detetive. Ela assume identidades e adapta histórias com a naturalidade de quem respira — e sempre obtém o que precisa.",
    avatarUrl: "/imagens-personagens/lena_avatar_v2.png",
    portraitUrl: "/imagens-personagens/lena_portrait_v2.png",
  },
  {
    slug: "silas-blackwood",
    name: "Silas Blackwood",
    codename: "Cipher",
    specialty: "Criptografia",
    personality: "Brilhante e Impaciente",
    description: "Nenhuma cifra resiste a Silas por mais de alguns minutos. O problema é que sua cabeça funciona tão rápido que ele não consegue entender por que os outros demoram tanto.",
    avatarUrl: "/imagens-personagens/silas_avatar_v2.png",
    portraitUrl: "/imagens-personagens/silas_portrait_v2.png",
  },
  {
    slug: "zara-khan",
    name: "Zara Khan",
    codename: "Spectra",
    specialty: "Investigação de Campo",
    personality: "Corajosa e Sarcástica",
    description: "Zara vai pessoalmente onde ninguém mais quer ir. Beco escuro, zona proibida, servidor físico desprotegido — ela já esteve lá antes de você terminar de fazer a pergunta.",
    avatarUrl: "/imagens-personagens/zara_avatar_v2.png",
    portraitUrl: "/imagens-personagens/zara_portrait_v2.png",
  },
];

// ─── Main Seed ────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Characters
  console.log("👤 Characters:");
  for (const char of CHARACTERS) {
    const existing = await db.query.characters.findFirst({
      where: eq(schema.characters.slug, char.slug),
    });
    if (!existing) {
      await db.insert(schema.characters).values(char);
      console.log(`  ✓ ${char.name} (${char.codename})`);
    } else {
      await db.update(schema.characters).set(char).where(eq(schema.characters.slug, char.slug));
      console.log(`  ~ ${char.name} (updated)`);
    }
  }

  // Fixed world locations
  console.log("\n🗺  World Locations:");
  const locationMap: Record<string, string> = {};

  for (const loc of LOCATIONS) {
    const existing = await db.query.locations.findFirst({
      where: eq(schema.locations.slug, loc.slug),
    });
    if (!existing) {
      const [inserted] = await db.insert(schema.locations).values(loc).returning();
      locationMap[loc.slug] = inserted.id;
      console.log(`  ✓ ${loc.name}`);
    } else {
      await db.update(schema.locations).set(loc).where(eq(schema.locations.slug, loc.slug));
      locationMap[loc.slug] = existing.id;
      console.log(`  ~ ${loc.name} (updated)`);
    }
  }

  // Fixed connections
  console.log("\n🔗 Connections:");
  // Clear and re-seed connections for idempotency
  const fromIds = Object.values(locationMap);
  // Delete all connections involving our locations
  for (const fromId of fromIds) {
    await db.delete(schema.locationConnections).where(
      eq(schema.locationConnections.fromId, fromId)
    );
  }
  for (const conn of CONNECTIONS) {
    await db.insert(schema.locationConnections).values({
      fromId: locationMap[conn.from],
      toId: locationMap[conn.to],
      transportType: conn.transport,
    });
  }
  console.log(`  ✓ ${CONNECTIONS.length} connections created`);

  await client.end();
  console.log("\n✅ Seed complete!");
  console.log("   Run `pnpm db:seed-cases` to seed the 5 cases.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
