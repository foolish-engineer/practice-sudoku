/** A single Sudoku cell: a digit 1–9, or "" for an empty cell. */
export type Cell = number | "";

/** A 9×9 Sudoku board. Empty cells are represented as "". */
export type Board = Cell[][];

/** A fully solved 9×9 Sudoku board. All cells are numbers 1–9. */
export type SolvedBoard = number[][];

/** The three difficulty levels. */
export type Difficulty = "easy" | "medium" | "hard";

/** Display label derived from a Difficulty. */
export type LevelLabel = "Easy" | "Medium" | "Hard";

/** Coordinates of the currently highlighted hint cell. */
export type HintCell = { row: number; col: number } | null;

/** Return value of generatePuzzle. */
export interface PuzzleResult {
	puzzleBoard: Board;
	solvedBoard: SolvedBoard;
}
