import { describe, expect, it } from "vitest";
import { generatePuzzle } from "../core/sudoku";
import type { GeneratePuzzleRequest } from "./puzzleWorker";

describe("puzzleWorker — GeneratePuzzleRequest type contract", () => {
	it("GeneratePuzzleRequest is structurally valid and generatePuzzle returns a 9×9 board pair", () => {
		const request: GeneratePuzzleRequest = {
			type: "GENERATE_PUZZLE",
			difficulty: "easy",
			id: 42,
		};

		const result = generatePuzzle(request.difficulty);
		expect(result.puzzleBoard).toHaveLength(9);
		expect(result.solvedBoard).toHaveLength(9);
	});
});
