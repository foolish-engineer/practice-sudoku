import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary", () => {
	it("initializes with hasError: false and error: null", () => {
		const boundary = new ErrorBoundary({ children: "content" });
		expect(boundary.state).toEqual({ hasError: false, error: null });
	});

	it("getDerivedStateFromError updates state to hasError: true with the error", () => {
		const error = new Error("Test puzzle solver failure");
		const state = ErrorBoundary.getDerivedStateFromError(error);
		expect(state).toEqual({ hasError: true, error });
	});

	it("resetErrorBoundary calls setState with hasError: false and error: null", () => {
		const boundary = new ErrorBoundary({ children: "content" });
		const setStateSpy = vi
			.spyOn(boundary, "setState")
			.mockImplementation(() => {});

		boundary.resetErrorBoundary();
		expect(setStateSpy).toHaveBeenCalledWith({
			hasError: false,
			error: null,
		});
	});

	it("calls onError callback when componentDidCatch is invoked", () => {
		const onError = vi.fn();
		const boundary = new ErrorBoundary({ children: "content", onError });
		const error = new Error("Render error");
		const errorInfo = { componentStack: "at ChildComponent" };

		boundary.componentDidCatch(error, errorInfo);
		expect(onError).toHaveBeenCalledWith(error, errorInfo);
	});

	it("renders children when hasError is false", () => {
		const boundary = new ErrorBoundary({ children: "Child Content" });
		expect(boundary.render()).toBe("Child Content");
	});

	it("renders custom fallback function when hasError is true", () => {
		const fallbackFn = vi.fn().mockReturnValue("Custom Fallback");
		const boundary = new ErrorBoundary({
			children: "Child Content",
			fallback: fallbackFn,
		});
		const error = new Error("Solver explosion");
		boundary.state = { hasError: true, error };

		const result = boundary.render();
		expect(result).toBe("Custom Fallback");
		expect(fallbackFn).toHaveBeenCalledWith(
			expect.objectContaining({
				error,
				resetErrorBoundary: boundary.resetErrorBoundary,
			}),
		);
	});
});
