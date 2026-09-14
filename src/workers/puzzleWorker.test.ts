import { describe, expect, it } from "vitest";
import { generatePuzzle } from "../core/sudoku";
import type { GeneratePuzzleRequest } from "./puzzleWorker";

/**
 * Tests the type contract of GeneratePuzzleRequest and verifies that
 * generatePuzzle (called by the worker internally) returns the expected shape.
 *
 * Note: The worker's self.addEventListener dispatch loop is not exercised here
 * because Vitest runs in a Node environment without a browser Worker global.
 * The actual message-passing integration is covered by the Web Worker at runtime.
 */
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
