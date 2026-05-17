/**
 * Gera o arquivo sql/04_seed_data.sql com todos os INSERTs
 * para rodar no Supabase SQL Editor sem precisar de conexão direta.
 *
 * Uso: tsx scripts/generate-seed-sql.ts
 */
import { writeFileSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const lines: string[] = [
  "-- ══════════════════════════════════════════════════════",
  "-- CIFRA URBANA — 04_seed_data.sql",
  "-- Cole e execute no Supabase SQL Editor",
  "-- ══════════════════════════════════════════════════════",
  "",
];

function esc(v: string | null | undefined): string {
  if (v === null || v === undefined) return "NULL";
  return `'${v.replace(/'/g, "''")}'`;
}

// ─── CHARACTERS ─────────────────────────────────────────
const characters = [
  { slug: "kaito-nakamura", name: "Kaito Nakamura", codename: "Ghost", specialty: "Infiltração Digital", personality: "Calmo, Lógico e Leal", description: "Especialista em penetrar sistemas sem deixar rastro. Kaito opera nas sombras digitais com precisão cirúrgica.", avatar_url: "/imagens-personagens/kaito_avatar_v2.png", portrait_url: "/imagens-personagens/kaito_portrait_v2.png" },
  { slug: "anya-petrova", name: "Anya Petrova", codename: "Oracle", specialty: "Análise de Dados", personality: "Intuitiva e Perspicaz", description: "Ela vê padrões onde outros veem ruído. Ex-analista da Agência Névoa, processa informações com velocidade sobrenatural.", avatar_url: "/imagens-personagens/anya_avatar_v2.png", portrait_url: "/imagens-personagens/anya_portrait_v2.png" },
  { slug: "jax-thorne", name: "Jax Thorne", codename: "Rivet", specialty: "Infraestrutura Física", personality: "Prático e Cínico", description: "Enquanto os outros olham para as telas, Jax olha para os canos, cabos e paredes. Conhece cada esquina de Nova Kyros.", avatar_url: "/imagens-personagens/jax_avatar_v2.png", portrait_url: "/imagens-personagens/jax_portrait_v2.png" },
  { slug: "lena-volkov", name: "Lena Volkov", codename: "Echo", specialty: "Engenharia Social", personality: "Carismática e Adaptável", description: "Toda testemunha conta mais para Lena. Assume identidades e adapta histórias com naturalidade de quem respira.", avatar_url: "/imagens-personagens/lena_avatar_v2.png", portrait_url: "/imagens-personagens/lena_portrait_v2.png" },
  { slug: "silas-blackwood", name: "Silas Blackwood", codename: "Cipher", specialty: "Criptografia", personality: "Brilhante e Impaciente", description: "Nenhuma cifra resiste a Silas por mais de alguns minutos. O problema é que sua cabeça funciona rápido demais.", avatar_url: "/imagens-personagens/silas_avatar_v2.png", portrait_url: "/imagens-personagens/silas_portrait_v2.png" },
  { slug: "zara-khan", name: "Zara Khan", codename: "Spectra", specialty: "Investigação de Campo", personality: "Corajosa e Sarcástica", description: "Zara vai pessoalmente onde ninguém mais quer ir. Beco escuro, zona proibida — ela já esteve lá antes de você perguntar.", avatar_url: "/imagens-personagens/zara_avatar_v2.png", portrait_url: "/imagens-personagens/zara_portrait_v2.png" },
];

lines.push("-- ─── PERSONAGENS ──────────────────────────────────────");
lines.push("INSERT INTO characters (slug, name, codename, specialty, personality, description, avatar_url, portrait_url)");
lines.push("VALUES");
const charVals = characters.map(c =>
  `  (${esc(c.slug)}, ${esc(c.name)}, ${esc(c.codename)}, ${esc(c.specialty)}, ${esc(c.personality)}, ${esc(c.description)}, ${esc(c.avatar_url)}, ${esc(c.portrait_url)})`
);
lines.push(charVals.join(",\n") + ";");
lines.push("ON CONFLICT (slug) DO UPDATE SET".replace("ON CONFLICT", "\nON CONFLICT"));
// Actually use proper upsert
lines.pop(); lines.pop();
lines.push(charVals.join(",\n"));
lines.push("ON CONFLICT (slug) DO UPDATE SET");
lines.push("  name = EXCLUDED.name, codename = EXCLUDED.codename,");
lines.push("  specialty = EXCLUDED.specialty, personality = EXCLUDED.personality,");
lines.push("  description = EXCLUDED.description, avatar_url = EXCLUDED.avatar_url,");
lines.push("  portrait_url = EXCLUDED.portrait_url;");
lines.push("");

// ─── LOCATIONS ──────────────────────────────────────────
const locations = [
  { slug: "torre-dados", name: "Torre de Dados", subtitle: "Data Spire", description: "O centro nevrálgico da rede digital de Nova Kyros.", image_url: "/imagens-locais/torre_dados_detalhe.png", icon_url: "/imagens-locais/torre_dados_icone.png", map_x: "0.2000", map_y: "0.2800", is_start_hub: false },
  { slug: "mercado-neon", name: "Mercado de Néon", subtitle: "Neon Bazaar", description: "Onde informações, hardware e segredos são trocados.", image_url: "/imagens-locais/mercado_neon_detalhe.png", icon_url: "/imagens-locais/mercado_neon_icone.png", map_x: "0.1500", map_y: "0.6500", is_start_hub: false },
  { slug: "docas-silicio", name: "Docas de Silício", subtitle: "Silicon Docks", description: "Ponto de entrada de contrabando digital.", image_url: "/imagens-locais/docas_silicio_detalhe.png", icon_url: "/imagens-locais/docas_silicio_icone.png", map_x: "0.8500", map_y: "0.6500", is_start_hub: false },
  { slug: "terminal-subterraneo", name: "Terminal Subterrâneo", subtitle: "The Undergrid", description: "A rede de túneis de serviço esquecida.", image_url: "/imagens-locais/terminal_subterraneo_detalhe.png", icon_url: "/imagens-locais/terminal_subterraneo_icone.png", map_x: "0.5000", map_y: "0.5000", is_start_hub: false },
  { slug: "catedral-codigo", name: "Catedral do Código", subtitle: "Code Cathedral", description: "Um antigo centro de processamento convertido em arquivo sagrado.", image_url: "/imagens-locais/catedral_codigo_detalhe.png", icon_url: "/imagens-locais/catedral_codigo_icone.png", map_x: "0.8000", map_y: "0.2800", is_start_hub: false },
  { slug: "observatorio-zenite", name: "Observatório Zenite", subtitle: "Zenith Observatory", description: "O ponto mais alto de Nova Kyros. Usado para interceptação de sinais.", image_url: "/imagens-locais/observatorio_zenite_detalhe.png", icon_url: "/imagens-locais/observatorio_zenite_icone.png", map_x: "0.5000", map_y: "0.0800", is_start_hub: false },
  { slug: "beco-cifras", name: "Beco das Cifras", subtitle: "Cipher Alley", description: "O local onde o crime começou. Todo caso nasce neste beco.", image_url: "/imagens-locais/beco_cifras_detalhe.png", icon_url: "/imagens-locais/beco_cifras_icone.png", map_x: "0.5000", map_y: "0.8800", is_start_hub: true },
];

lines.push("-- ─── LOCAIS (MAPA FIXO) ───────────────────────────────");
lines.push("INSERT INTO locations (slug, name, subtitle, description, image_url, icon_url, map_x, map_y, is_start_hub)");
lines.push("VALUES");
const locVals = locations.map(l =>
  `  (${esc(l.slug)}, ${esc(l.name)}, ${esc(l.subtitle)}, ${esc(l.description)}, ${esc(l.image_url)}, ${esc(l.icon_url)}, ${l.map_x}, ${l.map_y}, ${l.is_start_hub})`
);
lines.push(locVals.join(",\n"));
lines.push("ON CONFLICT (slug) DO UPDATE SET");
lines.push("  name = EXCLUDED.name, description = EXCLUDED.description,");
lines.push("  image_url = EXCLUDED.image_url, icon_url = EXCLUDED.icon_url,");
lines.push("  map_x = EXCLUDED.map_x, map_y = EXCLUDED.map_y, is_start_hub = EXCLUDED.is_start_hub;");
lines.push("");

// ─── CONNECTIONS ────────────────────────────────────────
const connections = [
  ["beco-cifras", "terminal-subterraneo", "magrail"],
  ["beco-cifras", "mercado-neon", "drone"],
  ["beco-cifras", "docas-silicio", "drone"],
  ["terminal-subterraneo", "torre-dados", "hyperloop"],
  ["terminal-subterraneo", "catedral-codigo", "hyperloop"],
  ["terminal-subterraneo", "observatorio-zenite", "hyperloop"],
  ["torre-dados", "mercado-neon", "drone"],
  ["torre-dados", "observatorio-zenite", "drone"],
  ["catedral-codigo", "docas-silicio", "drone"],
  ["catedral-codigo", "observatorio-zenite", "drone"],
  ["mercado-neon", "docas-silicio", "magrail"],
];

lines.push("-- ─── CONEXÕES ─────────────────────────────────────────");
lines.push("-- Limpar e reinserir conexões");
lines.push("DELETE FROM location_connections;");
lines.push("INSERT INTO location_connections (from_id, to_id, transport_type)");
lines.push("SELECT f.id, t.id, conn.transport::transport_type");
lines.push("FROM (VALUES");
const connVals = connections.map(([f, t, tr]) => `  (${esc(f)}, ${esc(t)}, ${esc(tr)})`);
lines.push(connVals.join(",\n"));
lines.push(") AS conn(from_slug, to_slug, transport)");
lines.push("JOIN locations f ON f.slug = conn.from_slug");
lines.push("JOIN locations t ON t.slug = conn.to_slug;");
lines.push("");

// ─── CASES ──────────────────────────────────────────────
interface CaseJSON {
  slug: string;
  title: string;
  narrative_intro: string;
  difficulty: string;
  max_turns: number;
  max_errors: number;
  recommended_players_min: number;
  recommended_players_max: number;
  solution_who: string;
  solution_where_slug: string;
  solution_how: string;
  solution_why: string;
  solution_explanation: string;
  clues: Array<{
    location_slug: string;
    type: string;
    display_content: string;
    decoded_hint: string | null;
    reveals_field: string;
    order: number;
  }>;
}

const casesDir = join(process.cwd(), "data", "cases", "approved");
const caseFiles = readdirSync(casesDir).filter(f => f.endsWith(".json"));

lines.push("-- ─── CASOS ────────────────────────────────────────────");

for (const file of caseFiles) {
  const c: CaseJSON = JSON.parse(readFileSync(join(casesDir, file), "utf-8"));
  lines.push(`-- Caso: ${c.title}`);
  lines.push(`INSERT INTO cases (slug, title, narrative_intro, difficulty, max_turns, max_errors, recommended_players_min, recommended_players_max, solution_who, solution_where_id, solution_how, solution_why, solution_explanation)`);
  lines.push(`SELECT`);
  lines.push(`  ${esc(c.slug)}, ${esc(c.title)}, ${esc(c.narrative_intro)},`);
  lines.push(`  ${esc(c.difficulty)}::difficulty, ${c.max_turns}, ${c.max_errors}, ${c.recommended_players_min}, ${c.recommended_players_max},`);
  lines.push(`  ${esc(c.solution_who)}, l.id, ${esc(c.solution_how)}, ${esc(c.solution_why)}, ${esc(c.solution_explanation)}`);
  lines.push(`FROM locations l WHERE l.slug = ${esc(c.solution_where_slug)}`);
  lines.push(`ON CONFLICT (slug) DO UPDATE SET`);
  lines.push(`  title = EXCLUDED.title, solution_who = EXCLUDED.solution_who,`);
  lines.push(`  solution_how = EXCLUDED.solution_how, solution_why = EXCLUDED.solution_why;`);
  lines.push("");

  // Clues
  lines.push(`-- Pistas: ${c.title}`);
  lines.push(`DELETE FROM clues WHERE case_id = (SELECT id FROM cases WHERE slug = ${esc(c.slug)});`);
  for (const clue of c.clues) {
    lines.push(`INSERT INTO clues (case_id, location_id, type, display_content, decoded_hint, reveals_field, "order")`);
    lines.push(`SELECT cs.id, l.id, ${esc(clue.type)}::clue_type, ${esc(clue.display_content)}, ${esc(clue.decoded_hint)}, ${esc(clue.reveals_field)}::reveals_field, ${clue.order}`);
    lines.push(`FROM cases cs, locations l`);
    lines.push(`WHERE cs.slug = ${esc(c.slug)} AND l.slug = ${esc(clue.location_slug)};`);
  }
  lines.push("");
}

const output = lines.join("\n");
writeFileSync(join(process.cwd(), "sql", "04_seed_data.sql"), output);
console.log("✅ sql/04_seed_data.sql gerado!");
console.log("   Cole e execute no Supabase SQL Editor.");
