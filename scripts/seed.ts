import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });

// ─── World Map ────────────────────────────────────────────────────────────────

const LOCATIONS = [
  {
    slug: "delegacia-central",
    name: "Delegacia Central",
    subtitle: "Police Headquarters",
    description: "O coração da lei na cidade. Tijolos vermelhos, mesas transbordando papéis e o eterno cheiro de café requentado. Aqui tudo começa.",
    imageUrl: "/imagens-locais/delegacia_central_detalhe.png",
    iconUrl: "/imagens-locais/delegacia_central_icone.png",
    mapX: "0.5000",
    mapY: "0.8800",
    isStartHub: true,
  },
  {
    slug: "cafe-pista-quente",
    name: "Café A Pista Quente",
    subtitle: "The Hot Lead Café",
    description: "Ponto de encontro neutro de detetives e informantes. Luz quente, jazz suave e envelopes que trocam de mão discretamente.",
    imageUrl: "/imagens-locais/cafe_pista_quente_detalhe.png",
    iconUrl: "/imagens-locais/cafe_pista_quente_icone.png",
    mapX: "0.1500",
    mapY: "0.6500",
    isStartHub: false,
  },
  {
    slug: "armazem-portuario",
    name: "Armazém Portuário",
    subtitle: "Port Warehouse",
    description: "Gigante de metal e tijolos à beira-mar, esquecido pela prefeitura. O som das ondas cobre o ranger de guindastes enferrujados — e outros barulhos.",
    imageUrl: "/imagens-locais/armazem_portuario_detalhe.png",
    iconUrl: "/imagens-locais/armazem_portuario_icone.png",
    mapX: "0.8500",
    mapY: "0.6500",
    isStartHub: false,
  },
  {
    slug: "biblioteca-publica",
    name: "Biblioteca Pública",
    subtitle: "Public Library",
    description: "Um labirinto de estantes que guarda mais do que livros: guarda o passado da cidade. Escadas em caracol levam a seções proibidas.",
    imageUrl: "/imagens-locais/biblioteca_publica_detalhe.png",
    iconUrl: "/imagens-locais/biblioteca_publica_icone.png",
    mapX: "0.5000",
    mapY: "0.5000",
    isStartHub: false,
  },
  {
    slug: "laboratorio-forense",
    name: "Laboratório Forense",
    subtitle: "Forensic Lab",
    description: "Onde a ciência encontra o crime. Ambiente estéril e ultra-tecnológico — béqueres borbulhantes, microscópios gigantes e telas de DNA.",
    imageUrl: "/imagens-locais/laboratorio_forense_detalhe.png",
    iconUrl: "/imagens-locais/laboratorio_forense_icone.png",
    mapX: "0.2000",
    mapY: "0.2800",
    isStartHub: false,
  },
  {
    slug: "beco-gato-preto",
    name: "Beco do Gato Preto",
    subtitle: "Black Cat Alley",
    description: "O local mais perigoso e informativo do mapa. Grafites vibrantes ganham vida sob luzes de neon. Gatos observam tudo com olhos brilhantes.",
    imageUrl: "/imagens-locais/beco_gato_preto_2025_detalhe.png",
    iconUrl: "/imagens-locais/beco_gato_preto_2025_icone.png",
    mapX: "0.8000",
    mapY: "0.2800",
    isStartHub: false,
  },
  {
    slug: "parque-oasis-verde",
    name: "Parque Oásis Verde",
    subtitle: "Green Oasis Park",
    description: "Um respiro de natureza no concreto, mas que esconde segredos sob sombras longas. Silêncio quebrado apenas pelo coaxar de sapos no lago.",
    imageUrl: "/imagens-locais/parque_urbano_detalhe.png",
    iconUrl: "/imagens-locais/parque_urbano_icone.png",
    mapX: "0.5000",
    mapY: "0.0800",
    isStartHub: false,
  },
] as const;

// Fixed world connections (bidirectional graph)
const CONNECTIONS: Array<{ from: string; to: string; transport: "drone" | "hyperloop" | "magrail" }> = [
  // Delegacia Central hub
  { from: "delegacia-central", to: "biblioteca-publica", transport: "magrail" },
  { from: "delegacia-central", to: "cafe-pista-quente", transport: "drone" },
  { from: "delegacia-central", to: "armazem-portuario", transport: "drone" },
  // Biblioteca Pública central connections
  { from: "biblioteca-publica", to: "laboratorio-forense", transport: "hyperloop" },
  { from: "biblioteca-publica", to: "beco-gato-preto", transport: "hyperloop" },
  { from: "biblioteca-publica", to: "parque-oasis-verde", transport: "hyperloop" },
  // Upper connections
  { from: "laboratorio-forense", to: "cafe-pista-quente", transport: "drone" },
  { from: "laboratorio-forense", to: "parque-oasis-verde", transport: "drone" },
  { from: "beco-gato-preto", to: "armazem-portuario", transport: "drone" },
  { from: "beco-gato-preto", to: "parque-oasis-verde", transport: "drone" },
  // Lower cross
  { from: "cafe-pista-quente", to: "armazem-portuario", transport: "magrail" },
];

// ─── Characters ───────────────────────────────────────────────────────────────

const CHARACTERS = [
  {
    slug: "faro-silva",
    name: "Detetive Faro Silva",
    codename: "Faro",
    specialty: "Investigação de Campo",
    personality: "Cético, Justo e Perspicaz",
    description: "Experiente e aparentemente desleixado, mas com uma mente afiada como navalha. Faro tem um faro inigualável para a verdade — e uma xícara de café fumegante sempre à mão.",
    avatarUrl: "/imagens-personagens/faro_avatar_2025_cartoonesco.png",
    portraitUrl: "/imagens-personagens/faro_portrait_2025_cartoonesco.png",
  },
  {
    slug: "lupa-costa",
    name: "Dra. Lupa Costa",
    codename: "Lupa",
    specialty: "Ciência Forense",
    personality: "Metódica, Hiperfocada e Excêntrica",
    description: "Cientista forense brilhante com obsessão por detalhes minúsculos. Lupa vê o mundo como um grande laboratório — e é capaz de extrair segredos de qualquer evidência.",
    avatarUrl: "/imagens-personagens/lupa_avatar_2025_cartoonesco.png",
    portraitUrl: "/imagens-personagens/lupa_portrait_2025_cartoonesco.png",
  },
  {
    slug: "flash-santos",
    name: "Flash Santos",
    codename: "Flash",
    specialty: "Jornalismo Investigativo",
    personality: "Carismático, Intrometido e Justo",
    description: "Jornalista destemido sempre em busca da próxima grande manchete. Flash usa câmera e bloco de notas para desvendar mistérios e expor a verdade — antes da polícia, se possível.",
    avatarUrl: "/imagens-personagens/flash_avatar_2025_cartoonesco.png",
    portraitUrl: "/imagens-personagens/flash_portrait_2025_cartoonesco.png",
  },
  {
    slug: "rino-pereira",
    name: "Chefe Rino Pereira",
    codename: "Rino",
    specialty: "Liderança Policial",
    personality: "Leal, Robusto e Paternal",
    description: "Chefe de polícia de bom coração mas de paciência limitada para burocracia. Rino é a força motriz da delegacia — fará de tudo para proteger a cidade e sua equipe.",
    avatarUrl: "/imagens-personagens/rino_avatar_2025_cartoonesco.png",
    portraitUrl: "/imagens-personagens/rino_portrait_2025_cartoonesco.png",
  },
  {
    slug: "pixel-mendes",
    name: "Pixel Mendes",
    codename: "Pixel",
    specialty: "Análise Digital",
    personality: "Introvertido, Genial e Intenso",
    description: "Jovem analista de TI que vive no mundo dos códigos e da internet. Pixel é um mago com computadores — a chave para desvendar qualquer pista digital deixada pelos criminosos.",
    avatarUrl: "/imagens-personagens/pixel_avatar_2025_cartoonesco.png",
    portraitUrl: "/imagens-personagens/pixel_portrait_2025_cartoonesco.png",
  },
  {
    slug: "sussurro-lima",
    name: "Agente Sussurro Lima",
    codename: "Sussurro",
    specialty: "Operações Secretas",
    personality: "Calma, Calculista e Enigmática",
    description: "Agente secreta misteriosa com habilidade incomparável para se infiltrar e coletar informações sem ser notada. Sussurro é a sombra que se move entre os segredos da cidade.",
    avatarUrl: "/imagens-personagens/sussurro_avatar_2025_cartoonesco.png",
    portraitUrl: "/imagens-personagens/sussurro_portrait_2025_cartoonesco.png",
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
  console.log("   Run `pnpm db:seed-cases` to seed the 2 cases.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
