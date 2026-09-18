import { describe, expect, it } from "vitest";
import { cn, formatTime } from "./index";

describe("utils", () => {
	describe("cn", () => {
		it("joins multiple class strings with a single space", () => {
			expect(cn("px-4", "py-2", "text-center")).toBe("px-4 py-2 text-center");
		});

		it("filters out falsy values (false, null, undefined, empty string)", () => {
			expect(cn("btn", false, null, undefined, "", "active")).toBe(
				"btn active",
			);
		});

		it("returns empty string when called with no arguments or all falsy values", () => {
			expect(cn()).toBe("");
			expect(cn(false, null, undefined)).toBe("");
		});
	});

	describe("formatTime", () => {
		it("formats 0 seconds as 0:00", () => {
			expect(formatTime(0)).toBe("0:00");
		});

		it("pads single-digit seconds with a leading zero", () => {
			expect(formatTime(5)).toBe("0:05");
			expect(formatTime(9)).toBe("0:09");
		});

		it("formats exactly 59 and 60 seconds", () => {
			expect(formatTime(59)).toBe("0:59");
			expect(formatTime(60)).toBe("1:00");
		});

		it("formats minutes and seconds accurately", () => {
			expect(formatTime(65)).toBe("1:05");
			expect(formatTime(125)).toBe("2:05");
		});

		it("formats multi-digit minutes accurately", () => {
			expect(formatTime(600)).toBe("10:00");
			expect(formatTime(3661)).toBe("61:01");
		});
	});
});
