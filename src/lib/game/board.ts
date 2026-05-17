/**
 * Tabuleiro 2D — 20 colunas × 15 linhas
 *
 * Tipos de célula:
 * -1 = parede (não navegável)
 *  0 = caminho
 * 10..16 = interior de local
 * 20..26 = entrada de local (seta)
 *
 * Locais:
 * 10 = laboratorio-forense  | 20 = entrada (cima)
 * 11 = parque-oasis-verde   | 21 = entrada (cima)
 * 12 = beco-gato-preto      | 22 = entrada (cima)
 * 13 = cafe-pista-quente    | 23 = entrada (direita)
 * 14 = biblioteca-publica   | 24 = entrada (cima)
 * 15 = armazem-portuario    | 25 = entrada (esquerda)
 * 16 = delegacia-central    | 26 = entrada (baixo)
 */

export const BOARD_ROWS = 15;
export const BOARD_COLS = 20;
export const CELL_PX = 44;

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

export const ENTRY_DIRECTION: Record<number, "up" | "down" | "left" | "right"> = {
  20: "up",
  21: "up",
  22: "up",
  23: "right",
  24: "up",
  25: "left",
  26: "down",
};

// Retângulos de imagem: [rowStart, rowEnd, colStart, colEnd]
// Corrigidos para coincidir com as células reais de cada sala
export const ROOM_RECTS: Record<string, [number, number, number, number]> = {
  "laboratorio-forense": [0, 2, 2, 5],
  "parque-oasis-verde":  [0, 2, 7, 11],
  "beco-gato-preto":     [0, 2, 14, 17],
  "cafe-pista-quente":   [6, 10, 0, 2],
  "biblioteca-publica":  [6, 10, 7, 12],
  "armazem-portuario":   [6, 10, 16, 18],
  "delegacia-central":   [12, 14, 6, 13],
};

// Todos os jogadores iniciam no mesmo ponto — corredor central acima da Delegacia
export const CHARACTER_START: Record<string, [number, number]> = {
  "faro-silva":    [11, 9],
  "lupa-costa":    [11, 9],
  "flash-santos":  [11, 9],
  "sussurro-lima": [11, 9],
  "pixel-mendes":  [11, 9],
  "rino-pereira":  [11, 9],
};

export const DEFAULT_START: [number, number] = [11, 9];

// ─── Grade do tabuleiro ─────────────────────────────────────────────────────
const W = -1;
const P = 0;

export const BOARD_GRID: number[][] = [
  //  0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
  [ W,  W, 10, 10, 10, 10,  W, 11, 11, 11, 11, 11,  W,  W, 12, 12, 12, 12,  W,  W], // 0
  [ W,  W, 10, 10, 10, 10,  W, 11, 11, 11, 11, 11,  W,  W, 12, 12, 12, 12,  W,  W], // 1
  [ W,  W, 10, 10, 10, 10,  W, 11, 11, 11, 11, 11,  W,  W, 12, 12, 12, 12,  W,  W], // 2
  [ P, 20, 20,  P,  P,  P,  P, 21, 21,  P, 21, 21,  P,  P,  P, 22, 22,  P,  P,  P], // 3
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 4
  [ P,  W,  W,  W,  P,  P,  P,  W,  W,  W,  W,  W,  W,  P,  P,  P,  W,  W,  W,  P], // 5
  [13, 13, 13, 23,  P,  P,  W, 14, 14, 14, 14, 14, 14,  W,  P,  P, 25, 15, 15,  P], // 6  cafe=1, armazem=1
  [13, 13, 13,  W,  P,  P,  W, 14, 14, 14, 14, 14, 14,  W,  P,  P,  W, 15, 15,  P], // 7
  [13, 13, 13,  W,  P,  P,  W, 14, 14, 14, 14, 14, 14,  W,  P,  P,  W, 15, 15,  P], // 8
  [13, 13, 13, 23,  P,  P,  W, 14, 14, 14, 14, 14, 14,  W,  P,  P, 25, 15, 15,  P], // 9  cafe=2, armazem=2
  [13, 13, 13,  W,  P,  P,  P, 24, 24, 24, 24,  P,  P,  P,  P,  P,  W, 15, 15,  P], // 10 biblioteca=4
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 11 ← corredor (start)
  [ W,  W,  W,  W,  W,  P,  W, 26, 26,  P, 26, 26,  W,  W,  P,  W,  W,  W,  W,  W], // 12 delegacia=4
  [ W,  W,  W,  W,  W,  P, 16, 16, 16, 16, 16, 16, 16, 16,  P,  W,  W,  W,  W,  W], // 13
  [ W,  W,  W,  W,  W,  P, 16, 16, 16, 16, 16, 16, 16, 16,  P,  W,  W,  W,  W,  W], // 14
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
