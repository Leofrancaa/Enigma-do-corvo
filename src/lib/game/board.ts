/**
 * Tabuleiro 2D — 20 colunas × 15 linhas, CELL_PX = 120px
 * Total: 2400 × 1800px (pannável + zoom)
 *
 * Regras de entrada:
 *  - Máx 4 por local, 1 por lado
 *  - Nunca adjacentes ortogonalmente
 *  - ROOM_RECTS nunca inclui células de entrada
 */

export const BOARD_ROWS = 15;
export const BOARD_COLS = 20;
export const CELL_PX = 120;

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

// Imagens: apenas células de sala, NUNCA sobrepostas com entradas
// Café: cols 1-4 (4 wide = 480px) — col 0 livre como caminho
// Armazém: cols 15-18 (4 wide = 480px) — col 19 livre como caminho
export const ROOM_RECTS: Record<string, [number, number, number, number]> = {
  "laboratorio-forense": [0, 2, 2, 5],
  "parque-oasis-verde":  [0, 2, 7, 11],
  "beco-gato-preto":     [0, 2, 14, 17],
  "cafe-pista-quente":   [6, 9, 1, 4],
  "biblioteca-publica":  [6, 9, 7, 12],
  "armazem-portuario":   [6, 9, 15, 18],
  "delegacia-central":   [12, 14, 6, 13],
};

export const CHARACTER_START: Record<string, [number, number]> = {
  "faro-silva":    [4, 9],
  "lupa-costa":    [4, 9],
  "flash-santos":  [4, 9],
  "sussurro-lima": [4, 9],
  "pixel-mendes":  [4, 9],
  "rino-pereira":  [4, 9],
};
export const DEFAULT_START: [number, number] = [4, 9];

const P = 0;

// Tudo walkable — sem paredes.
// Entradas numeradas por localidade:
//  20=lab  21=parque  22=beco  23=café  24=biblioteca  25=armazém  26=delegacia
export const BOARD_GRID: number[][] = [
  //  0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
  [ P,  P, 10, 10, 10, 10,  P, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12,  P,  P], // 0
  [ P,  P, 10, 10, 10, 10,  P, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12,  P,  P], // 1
  [ P,  P, 10, 10, 10, 10,  P, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12,  P,  P], // 2
  [ P,  P, 20,  P,  P, 20,  P,  P, 21,  P, 21,  P,  P,  P,  P, 22,  P, 22,  P,  P], // 3  ← entradas top rooms
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 4  ← START
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 5
  [ P, 13, 13, 13, 13,  P,  P, 14, 14, 14, 14, 14, 14,  P,  P, 15, 15, 15, 15,  P], // 6  col0 e col19 livres
  [ P, 13, 13, 13, 13, 23,  P, 14, 14, 14, 14, 14, 14,  P, 25, 15, 15, 15, 15,  P], // 7  café right=1, arm left=1
  [ P, 13, 13, 13, 13,  P, 24, 14, 14, 14, 14, 14, 14, 24,  P, 15, 15, 15, 15,  P], // 8  bibl left=1, right=1
  [ P, 13, 13, 13, 13,  P,  P, 14, 14, 14, 14, 14, 14,  P,  P, 15, 15, 15, 15,  P], // 9
  [ P,  P, 23,  P,  P,  P,  P,  P,  P, 24,  P,  P,  P,  P,  P,  P, 25,  P,  P,  P], // 10 bottom entries
  [ P,  P,  P,  P,  P,  P,  P, 26,  P,  P,  P, 26,  P,  P,  P,  P,  P,  P,  P,  P], // 11 delegacia top=2
  [ P,  P,  P,  P,  P, 26, 16, 16, 16, 16, 16, 16, 16, 16, 26,  P,  P,  P,  P,  P], // 12 delegacia sides=2 + room
  [ P,  P,  P,  P,  P,  P, 16, 16, 16, 16, 16, 16, 16, 16,  P,  P,  P,  P,  P,  P], // 13
  [ P,  P,  P,  P,  P,  P, 16, 16, 16, 16, 16, 16, 16, 16,  P,  P,  P,  P,  P,  P], // 14
];

// ─── Utilitários ─────────────────────────────────────────────────────────────

export function isNavigable(code: number): boolean {
  return code === 0 || (code >= 20 && code <= 26);
}
export function isRoomCell(code: number): boolean { return code >= 10 && code <= 16; }
export function isEntryCell(code: number): boolean { return code >= 20 && code <= 26; }
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
  return ([[0,1],[0,-1],[1,0],[-1,0]] as Array<[number,number]>)
    .map(([dr,dc]) => [row+dr, col+dc] as [number,number])
    .filter(([r,c]) => isNavigable(getCell(r,c)));
}
export function getReachableCells(fromRow: number, fromCol: number, maxSteps: number): Array<[number, number]> {
  if (maxSteps <= 0) return [];
  const visited = new Set<string>([`${fromRow},${fromCol}`]);
  const queue: Array<{ row: number; col: number; steps: number }> = [{ row: fromRow, col: fromCol, steps: 0 }];
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
