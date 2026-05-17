import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });

interface CaseJSON {
  slug: string;
  title: string;
  narrative_intro: string;
  difficulty: "facil" | "medio" | "dificil";
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
    type: "analogia" | "anagrama" | "cifra" | "referencia" | "depoimento" | "evidencia" | "plot_twist";
    display_content: string;
    decoded_hint: string | null;
    reveals_field: "who" | "where" | "how" | "why" | "context";
    order: number;
  }>;
}

async function seedCases() {
  console.log("🃏 Seeding cases...\n");

  // Load all fixed locations into a slug→id map
  const allLocations = await db.select().from(schema.locations);
  const locationMap: Record<string, string> = {};
  for (const loc of allLocations) {
    locationMap[loc.slug] = loc.id;
  }

  if (Object.keys(locationMap).length === 0) {
    console.error("❌ No locations found. Run `pnpm db:seed` first.");
    process.exit(1);
  }

  // Read all approved case JSON files
  const casesDir = join(process.cwd(), "data", "cases", "approved");
  const files = readdirSync(casesDir).filter((f) => f.endsWith(".json"));

  console.log(`   Found ${files.length} case files\n`);

  for (const file of files) {
    const raw = readFileSync(join(casesDir, file), "utf-8");
    const caseData: CaseJSON = JSON.parse(raw);

    // Resolve solution where
    const solutionWhereId = locationMap[caseData.solution_where_slug];
    if (!solutionWhereId) {
      console.error(`  ❌ ${file}: solution_where_slug '${caseData.solution_where_slug}' not found in world locations`);
      continue;
    }

    // Validate all clue locations exist
    const missingLocs = caseData.clues.filter((c) => !locationMap[c.location_slug]);
    if (missingLocs.length > 0) {
      console.error(`  ❌ ${file}: missing location slugs: ${missingLocs.map((c) => c.location_slug).join(", ")}`);
      continue;
    }

    // Upsert case
    const existing = await db.query.cases.findFirst({
      where: eq(schema.cases.slug, caseData.slug),
    });

    let caseId: string;
    if (!existing) {
      const [inserted] = await db
        .insert(schema.cases)
        .values({
          slug: caseData.slug,
          title: caseData.title,
          narrativeIntro: caseData.narrative_intro,
          difficulty: caseData.difficulty,
          maxTurns: caseData.max_turns,
          maxErrors: caseData.max_errors,
          recommendedPlayersMin: caseData.recommended_players_min,
          recommendedPlayersMax: caseData.recommended_players_max,
          solutionWho: caseData.solution_who,
          solutionWhereId,
          solutionHow: caseData.solution_how,
          solutionWhy: caseData.solution_why,
          solutionExplanation: caseData.solution_explanation,
        })
        .returning();
      caseId = inserted.id;
      console.log(`  ✓ Case: ${caseData.title}`);
    } else {
      await db
        .update(schema.cases)
        .set({
          title: caseData.title,
          narrativeIntro: caseData.narrative_intro,
          difficulty: caseData.difficulty,
          maxTurns: caseData.max_turns,
          maxErrors: caseData.max_errors,
          solutionWho: caseData.solution_who,
          solutionWhereId,
          solutionHow: caseData.solution_how,
          solutionWhy: caseData.solution_why,
          solutionExplanation: caseData.solution_explanation,
        })
        .where(eq(schema.cases.id, existing.id));
      caseId = existing.id;
      // Delete old clues to re-seed
      await db.delete(schema.clues).where(eq(schema.clues.caseId, caseId));
      console.log(`  ~ Case: ${caseData.title} (updated)`);
    }

    // Seed clues
    for (const clue of caseData.clues) {
      await db.insert(schema.clues).values({
        caseId,
        locationId: locationMap[clue.location_slug],
        type: clue.type,
        displayContent: clue.display_content,
        decodedHint: clue.decoded_hint,
        revealsField: clue.reveals_field,
        order: clue.order,
      });
    }
    console.log(`     → ${caseData.clues.length} clues at ${[...new Set(caseData.clues.map((c) => c.location_slug))].length} locations`);
  }

  await client.end();
  console.log("\n✅ Cases seeded!");
}

seedCases().catch((err) => {
  console.error("❌ Case seed failed:", err);
  process.exit(1);
});
