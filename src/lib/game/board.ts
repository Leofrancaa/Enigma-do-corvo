/**
 * Tabuleiro 2D — 20 colunas × 15 linhas
 * CELL_PX = 60px por célula
 *
 * Tipos:
 *  0 = caminho (walkable)
 * 10-16 = sala (não walkable, exibe imagem)
 * 20-26 = entrada de sala (walkable, seta)
 *
 * Locais:
 * 10 = laboratorio-forense   20 = entrada
 * 11 = parque-oasis-verde    21 = entrada
 * 12 = beco-gato-preto       22 = entrada
 * 13 = cafe-pista-quente     23 = entrada
 * 14 = biblioteca-publica    24 = entrada
 * 15 = armazem-portuario     25 = entrada
 * 16 = delegacia-central     26 = entrada
 */

export const BOARD_ROWS = 15;
export const BOARD_COLS = 20;
export const CELL_PX = 60;

export const ROOM_CODE_TO_SLUG: Record<number, string> = {
  10: "laboratorio-forense",
  11: "parque-oasis-verde",
  12: "beco-gato-preto",
  13: "cafe-pista-quente",
  14: "biblioteca-publica",
  15: "armazem-portuario",
  16: "delegacia-central",
};

export const ENTRY_CODE_TO_SLUG: Record<number, string> = {
  20: "laboratorio-forense",
  21: "parque-oasis-verde",
  22: "beco-gato-preto",
  23: "cafe-pista-quente",
  24: "biblioteca-publica",
  25: "armazem-portuario",
  26: "delegacia-central",
};

// Retângulos das IMAGENS — só cobre células de sala (10-16)
// Entradas ficam FORA destes retângulos
export const ROOM_RECTS: Record<string, [number, number, number, number]> = {
  "laboratorio-forense": [0, 2, 2, 5],
  "parque-oasis-verde":  [0, 2, 7, 11],
  "beco-gato-preto":     [0, 2, 14, 17],
  "cafe-pista-quente":   [6, 10, 0, 2],
  "biblioteca-publica":  [6, 9, 7, 12],
  "armazem-portuario":   [6, 10, 17, 18],
  "delegacia-central":   [13, 14, 6, 13],
};

// Todos iniciam no mesmo ponto — corredor central
export const CHARACTER_START: Record<string, [number, number]> = {
  "faro-silva":    [11, 9],
  "lupa-costa":    [11, 9],
  "flash-santos":  [11, 9],
  "sussurro-lima": [11, 9],
  "pixel-mendes":  [11, 9],
  "rino-pereira":  [11, 9],
};
export const DEFAULT_START: [number, number] = [11, 9];

// ─── Grade — tudo walkable exceto salas ──────────────────────────────────────
// Sem paredes (-1): qualquer célula não-sala é caminho
const P = 0; // caminho

export const BOARD_GRID: number[][] = [
  //  0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
  [ P,  P, 10, 10, 10, 10,  P, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12,  P,  P], // 0
  [ P,  P, 10, 10, 10, 10,  P, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12,  P,  P], // 1
  [ P,  P, 10, 10, 10, 10,  P, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12,  P,  P], // 2
  [ P, 20, 20,  P,  P,  P,  P, 21, 21,  P, 21, 21,  P,  P,  P, 22, 22,  P,  P,  P], // 3
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 4
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 5
  [13, 13, 13, 23,  P,  P,  P, 14, 14, 14, 14, 14, 14,  P,  P,  P, 25, 15, 15,  P], // 6
  [13, 13, 13,  P,  P,  P,  P, 14, 14, 14, 14, 14, 14,  P,  P,  P,  P, 15, 15,  P], // 7
  [13, 13, 13,  P,  P,  P,  P, 14, 14, 14, 14, 14, 14,  P,  P,  P,  P, 15, 15,  P], // 8
  [13, 13, 13, 23,  P,  P,  P, 14, 14, 14, 14, 14, 14,  P,  P,  P, 25, 15, 15,  P], // 9
  [13, 13, 13,  P,  P,  P,  P, 24, 24, 24, 24,  P,  P,  P,  P,  P,  P, 15, 15,  P], // 10
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 11 ← start
  [ P,  P,  P,  P,  P,  P,  P, 26,  P,  P,  P, 26,  P,  P,  P,  P,  P,  P,  P,  P], // 12 delegacia top=2
  [ P,  P,  P,  P,  P, 26, 16, 16, 16, 16, 16, 16, 16, 16, 26,  P,  P,  P,  P,  P], // 13 lados=2
  [ P,  P,  P,  P,  P,  P, 16, 16, 16, 16, 16, 16, 16, 16,  P,  P,  P,  P,  P,  P], // 14
];

// ─── Utilitários ─────────────────────────────────────────────────────────────

export function isNavigable(code: number): boolean {
  return code === 0 || (code >= 20 && code <= 26);
}

export function isRoomCell(code: number): boolean {
  return code >= 10 && code <= 16;
}

export function isEntryCell(code: number): boolean {
  return code >= 20 && code <= 26;
}

export function cellSlug(code: number): string | null {
  if (isRoomCell(code)) return ROOM_CODE_TO_SLUG[code] ?? null;
  if (isEntryCell(code)) return ENTRY_CODE_TO_SLUG[code] ?? null;
  return null;
}

export function getCell(row: number, col: number): number {
  if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return -1;
  return BOARD_GRID[row][col];
}

export function navigableNeighbors(row: number, col: number): Array<[number, number]> {
  const dirs: Array<[number, number]> = [[0,1],[0,-1],[1,0],[-1,0]];
  return dirs
    .map(([dr, dc]) => [row + dr, col + dc] as [number, number])
    .filter(([r, c]) => isNavigable(getCell(r, c)));
}

export function getReachableCells(
  fromRow: number,
  fromCol: number,
  maxSteps: number
): Array<[number, number]> {
  if (maxSteps <= 0) return [];
  const visited = new Set<string>([`${fromRow},${fromCol}`]);
  const queue: Array<{ row: number; col: number; steps: number }> = [
    { row: fromRow, col: fromCol, steps: 0 },
  ];
  const reachable: Array<[number, number]> = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.steps >= maxSteps) continue;
    for (const [nr, nc] of navigableNeighbors(cur.row, cur.col)) {
      const key = `${nr},${nc}`;
      if (!visited.has(key)) {
        visited.add(key);
        reachable.push([nr, nc]);
        queue.push({ row: nr, col: nc, steps: cur.steps + 1 });
      }
    }
  }
  return reachable;
}

export function playerLocationSlug(row: number, col: number): string | null {
  return cellSlug(getCell(row, col));
}
