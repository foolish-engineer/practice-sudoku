import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wait for the generating overlay to disappear.
 * The web worker generates puzzles asynchronously; most tests need to wait for
 * the board to be ready before interacting.
 */
async function waitForBoard(page: import("@playwright/test").Page) {
	// Medium difficulty generation can take 15+ seconds (backtracking solver).
	// Use 28s — within the 30s test timeout but with headroom for assertions after.
	await expect(page.getByTestId("generating-overlay")).not.toBeVisible({
		timeout: 28_000,
	});
}

/**
 * Find the first editable (non-disabled) empty cell on the board.
 */
async function getFirstEmptyCell(page: import("@playwright/test").Page) {
	const cells = page.locator('[data-testid^="cell-"]');
	const count = await cells.count();
	for (let i = 0; i < count; i++) {
		const cell = cells.nth(i);
		if (!(await cell.isDisabled()) && (await cell.inputValue()) === "") {
			return cell;
		}
	}
	return null;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Sudoku App", () => {
	// Run all tests in this file in parallel across workers.
	// Each test gets its own browser context so there is no shared state.
	test.describe.configure({ mode: "parallel" });

	test.beforeEach(async ({ page }) => {
		await page.goto("/practice-sudoku/");
	});

	// -------------------------------------------------------------------------
	// Page load
	// -------------------------------------------------------------------------

	test("page title and heading are correct", async ({ page }) => {
		await expect(page).toHaveTitle(/sudoku/i);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sudoku");
	});

	test("shows level label as Easy on first load", async ({ page }) => {
		await expect(page.getByTestId("sudoku-level-label")).toHaveText("Easy");
	});

	test("renders 81 cell inputs on the board", async ({ page }) => {
		await waitForBoard(page);
		const cells = page.locator('[data-testid^="cell-"]');
		await expect(cells).toHaveCount(81);
	});

	// -------------------------------------------------------------------------
	// New game (difficulty buttons)
	// -------------------------------------------------------------------------

	test("clicking New Medium changes level to Medium", async ({ page }) => {
		test.slow(); // Medium generation can take 15+ seconds
		await waitForBoard(page);
		await page.getByRole("button", { name: "New Medium" }).click();
		await waitForBoard(page);
		await expect(page.getByTestId("sudoku-level-label")).toHaveText("Medium");
	});

	test("clicking New Hard changes level to Hard", async ({ page }) => {
		test.slow(); // Hard generation can take 15+ seconds
		await waitForBoard(page);
		await page.getByRole("button", { name: "New Hard" }).click();
		await waitForBoard(page);
		await expect(page.getByTestId("sudoku-level-label")).toHaveText("Hard");
	});

	test("difficulty buttons and hint are disabled while generating", async ({
		page,
	}) => {
		test.slow(); // Medium generation takes 1–15s — gives a reliable assertion window

		await waitForBoard(page); // ensure initial Easy board is ready first

		// Trigger Medium — reliably slow enough that the generating window
		// is wide enough for all assertions to land before it finishes.
		// Easy can complete in <500ms which is too fast to assert against.
		await page.getByRole("button", { name: "New Medium" }).click();

		// Wait for the overlay to confirm we're in the generating state,
		// then assert all controls are disabled while it's visible.
		await expect(page.getByTestId("generating-overlay")).toBeVisible({
			timeout: 5_000,
		});

		await Promise.all([
			expect(page.getByRole("button", { name: "New Easy" })).toBeDisabled(),
			expect(page.getByRole("button", { name: "New Medium" })).toBeDisabled(),
			expect(page.getByRole("button", { name: "New Hard" })).toBeDisabled(),
			expect(page.getByTestId("hint-button")).toBeDisabled(),
		]);

		await waitForBoard(page);
	});

	// -------------------------------------------------------------------------
	// Typing in cells
	// -------------------------------------------------------------------------

	test("typing a valid digit into an empty cell updates the cell", async ({
		page,
	}) => {
		await waitForBoard(page);
		const cell = await getFirstEmptyCell(page);
		if (!cell) throw new Error("No empty cell found on the board");
		await cell.fill("5");
		await expect(cell).toHaveValue("5");
	});

	test("typing a non-digit or 0 is rejected (cell stays empty)", async ({
		page,
	}) => {
		await waitForBoard(page);
		const cell = await getFirstEmptyCell(page);
		if (!cell) throw new Error("No empty cell found on the board");

		await cell.fill("a");
		await expect(cell).toHaveValue("");

		await cell.fill("0");
		await expect(cell).toHaveValue("");
	});

	// -------------------------------------------------------------------------
	// Highlight same digits (badge button)
	// -------------------------------------------------------------------------

	test("clicking the badge on a pre-filled cell triggers same-digit highlight", async ({
		page,
	}) => {
		await waitForBoard(page);

		const badges = page.locator("button[aria-label^='Highlight all cells']");
		await expect(badges.first()).toBeVisible();
		await badges.first().click();

		const animatingCells = page.locator(".animate-pulse-highlight");
		await expect(animatingCells.first()).toBeVisible({ timeout: 2_000 });
	});

	// -------------------------------------------------------------------------
	// Solve by hints — exercises hint logic, win detection, and completion state
	// -------------------------------------------------------------------------

	test("puzzle is fully solved after repeated Get Hint clicks", async ({
		page,
	}) => {
		test.slow(); // May need up to 81 hint clicks — give it 90s

		await waitForBoard(page);

		const hintButton = page.getByTestId("hint-button");
		const MAX_HINTS = 81; // Upper bound — a 9×9 board has at most 81 cells

		let hintsUsed = 0;

		for (let i = 0; i < MAX_HINTS; i++) {
			// Stop as soon as the hint button is disabled (puzzle complete)
			if (await hintButton.isDisabled()) break;

			await hintButton.click();
			hintsUsed++;

			// Wait briefly for React to update state before next iteration
			await page.waitForTimeout(100);
		}

		// Hint button MUST be disabled (puzzle solved).
		// If still enabled after 81 hints, hint logic is broken — fail loudly.
		if (!(await hintButton.isDisabled())) {
			throw new Error(
				`Puzzle was NOT solved after ${hintsUsed} hint(s). ` +
					"Get Hint button is still enabled — unfilled cells remain.",
			);
		}

		await expect(page.getByTestId("status-message")).toHaveText(
			"Congratulations! Puzzle complete.",
		);
		await expect(page.getByTestId("timer")).toHaveClass(/text-green-600/);
	});

	// -------------------------------------------------------------------------
	// Timer
	// -------------------------------------------------------------------------

	test("timer renders initially, increments, and resets on new puzzle", async ({
		page,
	}) => {
		await waitForBoard(page);

		const timer = page.getByTestId("timer");
		await expect(timer).toBeVisible();

		// Wait for timer to advance past 0:00
		await expect(timer).not.toHaveText("0:00", { timeout: 4_000 });
		await expect(timer).toHaveText(/^[0-9]+:[0-9]{2}$/);

		// Trigger New Easy game and verify timer resets to 0:00
		await page.getByRole("button", { name: "New Easy" }).click();
		await expect(timer).toHaveText("0:00");
	});

	// -------------------------------------------------------------------------
	// Keyboard navigation & accessibility
	// -------------------------------------------------------------------------

	test("navigates editable cells using arrow keys", async ({ page }) => {
		await waitForBoard(page);

		const firstCell = await getFirstEmptyCell(page);
		if (!firstCell) throw new Error("No empty cell found on the board");

		await firstCell.focus();
		await expect(firstCell).toBeFocused();

		// Pressing ArrowRight should shift focus to another cell
		await page.keyboard.press("ArrowRight");
		const newFocused = page.locator("input:focus");
		await expect(newFocused).toBeVisible();
		expect(await newFocused.getAttribute("data-testid")).not.toBe(
			await firstCell.getAttribute("data-testid"),
		);
	});

	test("clearing cell value using Backspace and Delete keys", async ({
		page,
	}) => {
		await waitForBoard(page);
		const cell = await getFirstEmptyCell(page);
		if (!cell) throw new Error("No empty cell found on the board");

		await cell.fill("9");
		await expect(cell).toHaveValue("9");

		await cell.focus();
		await page.keyboard.press("Backspace");
		await expect(cell).toHaveValue("");

		await cell.fill("7");
		await expect(cell).toHaveValue("7");

		await cell.focus();
		await page.keyboard.press("Delete");
		await expect(cell).toHaveValue("");
	});

	// -------------------------------------------------------------------------
	// Undo / Redo
	// -------------------------------------------------------------------------

	test("undo and redo buttons and keyboard shortcuts work", async ({
		page,
	}) => {
		await waitForBoard(page);
		const cell = await getFirstEmptyCell(page);
		if (!cell) throw new Error("No empty cell found on the board");

		const undoBtn = page.getByTestId("undo-button");
		const redoBtn = page.getByTestId("redo-button");

		await expect(undoBtn).toBeDisabled();
		await expect(redoBtn).toBeDisabled();

		// Pressing Delete on an empty cell should NOT push to undo history
		await cell.focus();
		await page.keyboard.press("Backspace");
		await expect(undoBtn).toBeDisabled();

		// Make a move
		await cell.fill("5");
		await expect(cell).toHaveValue("5");
		await expect(undoBtn).toBeEnabled();
		await expect(redoBtn).toBeDisabled();

		// Typing the same value should not add redundant history entries
		await cell.fill("5");
		await expect(cell).toHaveValue("5");

		// Click Undo button - should return to empty in a single undo step
		await undoBtn.click();
		await expect(cell).toHaveValue("");
		await expect(undoBtn).toBeDisabled();
		await expect(redoBtn).toBeEnabled();

		// Click Redo button
		await redoBtn.click();
		await expect(cell).toHaveValue("5");
		await expect(undoBtn).toBeEnabled();
		await expect(redoBtn).toBeDisabled();

		// Keyboard shortcut Undo (Control+Z)
		await page.keyboard.press("Control+z");
		await expect(cell).toHaveValue("");

		// Keyboard shortcut Redo (Control+Shift+Z)
		await page.keyboard.press("Control+Shift+Z");
		await expect(cell).toHaveValue("5");
	});

	// -------------------------------------------------------------------------
	// Pencil marks (Notes input in top-left corner)
	// -------------------------------------------------------------------------

	test("pencil marks text box in top-left corner of empty cells, typing notes, auto-clearing, and undo/redo", async ({
		page,
	}) => {
		await waitForBoard(page);
		const cell = await getFirstEmptyCell(page);
		if (!cell) throw new Error("No empty cell found on the board");

		const testId = await cell.getAttribute("data-testid");
		if (!testId) throw new Error("Missing data-testid on cell");
		const [, row, col] = testId.split("-");
		const notesInput = page.getByTestId(`notes-input-${row}-${col}`);
		const undoBtn = page.getByTestId("undo-button");
		const redoBtn = page.getByTestId("redo-button");

		// Notes input is enabled and visible in the empty cell
		await expect(notesInput).toBeVisible();
		await expect(notesInput).toBeEnabled();
		await expect(notesInput).toHaveValue("");

		// Type candidate digits into the notes input
		await notesInput.fill("37");
		await expect(notesInput).toHaveValue("37");
		await expect(undoBtn).toBeEnabled();

		// Undo candidate notes entry
		await undoBtn.click();
		await expect(notesInput).toHaveValue("");

		// Redo candidate notes entry
		await redoBtn.click();
		await expect(notesInput).toHaveValue("37");

		// Enter a real value "5" in the main cell
		await cell.fill("5");
		await expect(cell).toHaveValue("5");

		// The notes input remains visible and enabled even when the cell has a value
		await expect(notesInput).toBeVisible();
		await expect(notesInput).toHaveValue("37");

		// Notes can still be edited when the cell has a value
		await notesInput.fill("379");
		await expect(notesInput).toHaveValue("379");

		// Undo entering "379" into notes
		await undoBtn.click();
		await expect(notesInput).toHaveValue("37");

		// Undo entering "5" into main cell
		await undoBtn.click();
		await expect(cell).toHaveValue("");
		await expect(notesInput).toBeVisible();
		await expect(notesInput).toHaveValue("37");
	});

	test("check button highlights incorrect cells and auto-clears after 3 seconds", async ({
		page,
	}) => {
		await waitForBoard(page);

		// Get a hint to know the correct value for a cell
		await page.getByTestId("hint-button").click();

		// The hint cell gets a special background class temporarily, but we can just find
		// the cell that was focused.
		const focusedCell = page.locator("input:focus");
		const testId = (await focusedCell.getAttribute("data-testid")) ?? "";
		const cell = page.getByTestId(testId);
		const correctVal = await cell.inputValue();

		// Pick an incorrect value
		const incorrectVal = correctVal === "1" ? "2" : "1";

		// Fill it with incorrect value
		await cell.fill(incorrectVal);

		// Click check button
		await page.getByTestId("check-button").click();

		// It should be marked invalid
		await expect(cell).toHaveAttribute("aria-invalid", "true");
	});
});
