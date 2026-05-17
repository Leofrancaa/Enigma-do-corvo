/**
 * Tabuleiro 2D — 30 colunas × 26 linhas, CELL_PX = 120px
 * Total: 3600 × 3120px (pannável + zoom 0.2x–2x)
 *
 * Salas grandes e bem espaçadas:
 *   Lab 6×5 = 720×600px | Parque 8×5 = 960×600px | Beco 7×5 = 840×600px
 *   Café 6×8 = 720×960px | Biblioteca 10×8 = 1200×960px | Armazém 7×8 = 840×960px
 *   Delegacia 11×4 = 1320×480px
 *
 * Gap entre grupos de salas: ≥ 4 linhas de corredor
 * Entradas: 1 por lado, nunca adjacentes
 */

export const BOARD_ROWS = 26;
export const BOARD_COLS = 30;
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

// Imagens: só células de sala, entradas ficam fora dos retângulos
export const ROOM_RECTS: Record<string, [number, number, number, number]> = {
  "laboratorio-forense": [2, 6, 2, 7],
  "parque-oasis-verde":  [2, 6, 10, 17],
  "beco-gato-preto":     [2, 6, 20, 26],
  "cafe-pista-quente":   [11, 18, 0, 5],
  "biblioteca-publica":  [11, 18, 10, 19],
  "armazem-portuario":   [11, 18, 23, 29],
  "delegacia-central":   [22, 25, 9, 19],
};

// Ponto de partida único — gap central entre top e middle rooms
export const CHARACTER_START: Record<string, [number, number]> = {
  "faro-silva":    [9, 14],
  "lupa-costa":    [9, 14],
  "flash-santos":  [9, 14],
  "sussurro-lima": [9, 14],
  "pixel-mendes":  [9, 14],
  "rino-pereira":  [9, 14],
};
export const DEFAULT_START: [number, number] = [9, 14];

const P = 0;

// Entradas (sem paredes — tudo walkable exceto salas):
//  Lab 20: (7,2)↑ (7,5)↑
//  Parque 21: (7,11)↑ (7,15)↑
//  Beco 22: (7,22)↑ (7,25)↑
//  Café 23: (12,6)← (19,2)↑
//  Biblioteca 24: (16,9)→ (12,20)← (19,14)↑
//  Armazém 25: (16,22)→ (19,26)↑
//  Delegacia 26: (21,11)↓ (21,16)↓ (22,8)→ (22,20)←
export const BOARD_GRID: number[][] = [
  //  0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 0
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 1
  [ P,  P, 10, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12, 12, 12,  P,  P,  P], // 2
  [ P,  P, 10, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12, 12, 12,  P,  P,  P], // 3
  [ P,  P, 10, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12, 12, 12,  P,  P,  P], // 4
  [ P,  P, 10, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12, 12, 12,  P,  P,  P], // 5
  [ P,  P, 10, 10, 10, 10, 10, 10,  P,  P, 11, 11, 11, 11, 11, 11, 11, 11,  P,  P, 12, 12, 12, 12, 12, 12, 12,  P,  P,  P], // 6
  [ P,  P, 20,  P,  P, 20,  P,  P,  P,  P,  P, 21,  P,  P,  P, 21,  P,  P,  P,  P,  P,  P, 22,  P,  P, 22,  P,  P,  P,  P], // 7 ← entradas top
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 8
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 9  ← START
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 10
  [13, 13, 13, 13, 13, 13,  P,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,  P,  P,  P, 15, 15, 15, 15, 15, 15, 15], // 11
  [13, 13, 13, 13, 13, 13, 23,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 24,  P,  P, 15, 15, 15, 15, 15, 15, 15], // 12 ← café→ | biblioteca←
  [13, 13, 13, 13, 13, 13,  P,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,  P,  P,  P, 15, 15, 15, 15, 15, 15, 15], // 13
  [13, 13, 13, 13, 13, 13,  P,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,  P,  P,  P, 15, 15, 15, 15, 15, 15, 15], // 14
  [13, 13, 13, 13, 13, 13,  P,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,  P,  P,  P, 15, 15, 15, 15, 15, 15, 15], // 15
  [13, 13, 13, 13, 13, 13,  P,  P,  P, 24, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,  P,  P, 25, 15, 15, 15, 15, 15, 15, 15], // 16 ← biblioteca→ | armazém←
  [13, 13, 13, 13, 13, 13,  P,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,  P,  P,  P, 15, 15, 15, 15, 15, 15, 15], // 17
  [13, 13, 13, 13, 13, 13,  P,  P,  P,  P, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,  P,  P,  P, 15, 15, 15, 15, 15, 15, 15], // 18
  [ P,  P, 23,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P, 24,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P, 25,  P,  P,  P], // 19 ← entradas bottom
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 20
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P, 26,  P,  P,  P,  P, 26,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 21 ← delegacia top
  [ P,  P,  P,  P,  P,  P,  P,  P, 26, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 26,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 22 ← lados+sala
  [ P,  P,  P,  P,  P,  P,  P,  P,  P, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 23
  [ P,  P,  P,  P,  P,  P,  P,  P,  P, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 24
  [ P,  P,  P,  P,  P,  P,  P,  P,  P, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 25
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
  const queue: Array<{row:number;col:number;steps:number}> = [{row:fromRow,col:fromCol,steps:0}];
  const reachable: Array<[number,number]> = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.steps >= maxSteps) continue;
    for (const [nr,nc] of navigableNeighbors(cur.row, cur.col)) {
      const key = `${nr},${nc}`;
      if (!visited.has(key)) {
        visited.add(key);
        reachable.push([nr,nc]);
        queue.push({row:nr,col:nc,steps:cur.steps+1});
      }
    }
  }
  return reachable;
}
export function playerLocationSlug(row: number, col: number): string | null {
  return cellSlug(getCell(row, col));
}
