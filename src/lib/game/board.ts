/**
 * Definição do tabuleiro 2D — estilo Scotland Yard
 * 20 colunas × 15 linhas
 *
 * Tipos de célula:
 * -1 = parede (não navegável, fundo escuro)
 *  0 = caminho (quadradinho navegável)
 * 10..16 = interior de local (exibe imagem)
 * 20..26 = entrada de local (caminho com seta)
 *
 * Locais (índice → slug):
 * 10 = laboratorio-forense  | 20 = entrada laboratorio
 * 11 = parque-oasis-verde   | 21 = entrada parque
 * 12 = beco-gato-preto      | 22 = entrada beco
 * 13 = cafe-pista-quente    | 23 = entrada café
 * 14 = biblioteca-publica   | 24 = entrada biblioteca
 * 15 = armazem-portuario    | 25 = entrada armazém
 * 16 = delegacia-central    | 26 = entrada delegacia
 */

export const BOARD_ROWS = 15;
export const BOARD_COLS = 20;
export const CELL_PX = 38; // pixels por célula no SVG

// Mapeamento: código de sala → slug do local
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

// Direção da seta de entrada (para o SVG)
export const ENTRY_DIRECTION: Record<number, "up" | "down" | "left" | "right"> = {
  20: "up",
  21: "up",
  22: "up",
  23: "right",
  24: "up",
  25: "left",
  26: "down",
};

// Retângulos dos locais no tabuleiro [rowStart, rowEnd, colStart, colEnd]
export const ROOM_RECTS: Record<string, [number, number, number, number]> = {
  "laboratorio-forense": [0, 2, 2, 5],
  "parque-oasis-verde":  [0, 2, 7, 11],
  "beco-gato-preto":     [0, 2, 14, 17],
  "cafe-pista-quente":   [5, 9, 0, 3],
  "biblioteca-publica":  [5, 9, 7, 12],
  "armazem-portuario":   [5, 9, 16, 19],
  "delegacia-central":   [12, 14, 6, 13],
};

// Posições de início por personagem (todos em células de caminho)
export const CHARACTER_START: Record<string, [number, number]> = {
  "faro-silva":     [3,  9],
  "lupa-costa":     [3,  3],
  "flash-santos":   [10, 3],
  "sussurro-lima":  [10, 16],
  "pixel-mendes":   [3, 15],
  "rino-pereira":   [10, 10],
};

export const DEFAULT_START: [number, number] = [10, 9];

// ─── Grade do tabuleiro ─────────────────────────────────────────────────────
// W  = -1 (parede)
// P  =  0 (caminho)
// Room cells: 10-16
// Entry cells: 20-26
const W = -1;
const P = 0;

export const BOARD_GRID: number[][] = [
  //  0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19
  [ W,  W, 10, 10, 10, 10,  W, 11, 11, 11, 11, 11,  W,  W, 12, 12, 12, 12,  W,  W], // 0
  [ W,  W, 10, 10, 10, 10,  W, 11, 11, 11, 11, 11,  W,  W, 12, 12, 12, 12,  W,  W], // 1
  [ W,  W, 10, 10, 10, 10,  W, 11, 11, 11, 11, 11,  W,  W, 12, 12, 12, 12,  W,  W], // 2
  [ P, 20, 20,  P,  P,  P,  P, 21, 21,  P, 21, 21,  P,  P,  P, 22, 22,  P,  P,  P], // 3
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 4 ← caminho H
  [ P,  W,  W,  W,  P,  P,  P,  W,  W,  W,  W,  W,  W,  P,  P,  P,  W,  W,  W,  P], // 5
  [13, 13, 13, 23,  P,  P, 24, 14, 14, 14, 14, 14, 14, 24,  P,  P, 25, 15, 15,  P], // 6
  [13, 13, 13, 23,  P,  P, 24, 14, 14, 14, 14, 14, 14, 24,  P,  P, 25, 15, 15,  P], // 7
  [13, 13, 13,  W,  P,  P,  W, 14, 14, 14, 14, 14, 14,  W,  P,  P,  W, 15, 15,  P], // 8
  [13, 13, 13, 23,  P,  P,  W, 14, 14, 14, 14, 14, 14,  W,  P,  P, 25, 15, 15,  P], // 9
  [13, 13, 13,  W,  P,  P,  P, 24, 24, 24, 24, 24, 24,  P,  P,  P,  W, 15, 15,  P], // 10
  [ P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P,  P], // 11 ← caminho H
  [ W,  W,  W,  W,  W,  P,  W, 26, 26,  P, 26, 26,  W,  W,  P,  W,  W,  W,  W,  W], // 12
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

/** Vizinhos navegáveis de uma célula (4 direções, sem diagonais) */
export function navigableNeighbors(row: number, col: number): Array<[number, number]> {
  const dirs: Array<[number, number]> = [[0,1],[0,-1],[1,0],[-1,0]];
  return dirs
    .map(([dr, dc]) => [row + dr, col + dc] as [number, number])
    .filter(([r, c]) => isNavigable(getCell(r, c)));
}

/** BFS: todas as células navegáveis alcançáveis em até maxSteps passos */
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

/** Retorna o slug do local que o jogador ocupa (se estiver em entrada ou interior) */
export function playerLocationSlug(row: number, col: number): string | null {
  return cellSlug(getCell(row, col));
}
