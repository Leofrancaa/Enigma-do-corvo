/**
 * Tabuleiro 2D — 24 colunas × 20 linhas, CELL_PX = 120px
 * Total: 2880 × 2400px (pannável + zoom 0.25x–1.8x)
 *
 * Locais maiores e bem espaçados:
 *   Lab/Beco 5×4 = 600×480px | Parque 7×4 = 840×480px
 *   Café/Armazém 5×6 = 600×720px | Biblioteca 7×6 = 840×720px
 *   Delegacia 8×3 = 960×360px
 *
 * Entradas: 1 por lado, nunca adjacentes
 */

export const BOARD_ROWS = 20;
export const BOARD_COLS = 24;
export const CELL_PX    = 120;

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

// Imagens: cobre exatamente as células de sala (10-16)
export const ROOM_RECTS: Record<string, [number, number, number, number]> = {
  "laboratorio-forense": [1, 4, 2, 6],
  "parque-oasis-verde":  [1, 4, 9, 15],
  "beco-gato-preto":     [1, 4, 18, 22],
  "cafe-pista-quente":   [8, 13, 1, 5],
  "biblioteca-publica":  [8, 13, 9, 15],
  "armazem-portuario":   [8, 13, 18, 22],
  "delegacia-central":   [17, 19, 8, 15],
};

// Todos iniciam no corredor central (longe de qualquer entrada)
export const CHARACTER_START: Record<string, [number, number]> = {
  "faro-silva":    [7, 11],
  "lupa-costa":    [7, 11],
  "flash-santos":  [7, 11],
  "sussurro-lima": [7, 11],
  "pixel-mendes":  [7, 11],
  "rino-pereira":  [7, 11],
};
export const DEFAULT_START: [number, number] = [7, 11];

const P = 0;

// Tudo walkable — sem paredes (-1). Cada célula é caminho ou sala.
// Entradas por sala e sua posição (verificadas com entryDir):
//   Lab 20: (5,2)↑ (5,6)↑
//   Parque 21: (5,10)↑ (5,14)↑
//   Beco 22: (5,19)↑ (5,21)↑
//   Café 23: (10,6)← (14,3)↑
//   Biblioteca 24: (10,8)→ (11,16)← (14,12)↑
//   Armazém 25: (10,17)→ (14,20)↑
//   Delegacia 26: (16,9)↓ (16,13)↓ (17,7)→ (17,16)←
export const BOARD_GRID: number[][] = [
  //  0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 0
  [ P,  P, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12,  P], // 1
  [ P,  P, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12,  P], // 2
  [ P,  P, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12,  P], // 3
  [ P,  P, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12,  P], // 4
  [ P,  P, 20,  P,  P,  P, 20,  P,  P,  P, 21,  P,  P,  P, 21,  P,  P,  P,  P, 22,  P, 22,  P,  P], // 5
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 6
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 7  ← START
  [ P, 13, 13, 13, 13, 13,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14,  P,  P, 15, 15, 15, 15, 15,  P], // 8
  [ P, 13, 13, 13, 13, 13,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14,  P,  P, 15, 15, 15, 15, 15,  P], // 9
  [ P, 13, 13, 13, 13, 13, 23,  P, 24, 14, 14, 14, 14, 14, 14, 14,  P, 25, 15, 15, 15, 15, 15,  P], // 10 entradas laterais
  [ P, 13, 13, 13, 13, 13,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14, 24,  P, 15, 15, 15, 15, 15,  P], // 11
  [ P, 13, 13, 13, 13, 13,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14,  P,  P, 15, 15, 15, 15, 15,  P], // 12
  [ P, 13, 13, 13, 13, 13,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14,  P,  P, 15, 15, 15, 15, 15,  P], // 13
  [ P,  P,  P, 23,  P,  P,  P,  P,  P,  P,  P,  P, 24,  P,  P,  P,  P,  P,  P,  P, 25,  P,  P,  P], // 14 entradas baixo
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 15
  [ P,  P,  P,  P,  P,  P,  P,  P,  P, 26,  P,  P,  P, 26,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 16 delegacia top
  [ P,  P,  P,  P,  P,  P,  P, 26, 16, 16, 16, 16, 16, 16, 16, 16, 26,  P,  P,  P,  P,  P,  P,  P], // 17 delegacia lados+sala
  [ P,  P,  P,  P,  P,  P,  P,  P, 16, 16, 16, 16, 16, 16, 16, 16,  P,  P,  P,  P,  P,  P,  P,  P], // 18
  [ P,  P,  P,  P,  P,  P,  P,  P, 16, 16, 16, 16, 16, 16, 16, 16,  P,  P,  P,  P,  P,  P,  P,  P], // 19
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
export function getReachableCells(fromRow: number, fromCol: number, maxSteps: number): Array<[number,number]> {
  if (maxSteps <= 0) return [];
  const visited = new Set<string>([`${fromRow},${fromCol}`]);
  const queue: Array<{ row: number; col: number; steps: number }> = [
    { row: fromRow, col: fromCol, steps: 0 },
  ];
  const reachable: Array<[number,number]> = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.steps >= maxSteps) continue;
    for (const [nr,nc] of navigableNeighbors(cur.row, cur.col)) {
      const key = `${nr},${nc}`;
      if (!visited.has(key)) {
        visited.add(key);
        reachable.push([nr,nc]);
        queue.push({ row: nr, col: nc, steps: cur.steps+1 });
      }
    }
  }
  return reachable;
}
export function playerLocationSlug(row: number, col: number): string | null {
  return cellSlug(getCell(row, col));
}
