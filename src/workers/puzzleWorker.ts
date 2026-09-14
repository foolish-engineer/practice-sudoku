import { generatePuzzle } from "../core/sudoku";
import type { Difficulty, PuzzleResult } from "../types/sudoku";

export interface GeneratePuzzleRequest {
	type: "GENERATE_PUZZLE";
	difficulty: Difficulty;
	id: number;
}

export interface GeneratePuzzleSuccessResponse {
	type: "PUZZLE_GENERATED";
	result: PuzzleResult;
	id: number;
}

export interface GeneratePuzzleErrorResponse {
	type: "PUZZLE_ERROR";
	error: string;
	id: number;
}

export type PuzzleWorkerResponse =
	| GeneratePuzzleSuccessResponse
	| GeneratePuzzleErrorResponse;

// Handle messages posted to the worker
self.addEventListener(
	"message",
	(event: MessageEvent<GeneratePuzzleRequest>) => {
		const { type, difficulty, id } = event.data;

		if (type === "GENERATE_PUZZLE") {
			try {
				const result = generatePuzzle(difficulty);
				const response: GeneratePuzzleSuccessResponse = {
					type: "PUZZLE_GENERATED",
					result,
					id,
				};
				self.postMessage(response);
			} catch (err) {
				const response: GeneratePuzzleErrorResponse = {
					type: "PUZZLE_ERROR",
					error: err instanceof Error ? err.message : String(err),
					id,
				};
				self.postMessage(response);
			}
		}
	},
);
