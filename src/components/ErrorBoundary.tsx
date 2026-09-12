import { Component, type ErrorInfo, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { BTN_BASE, BTN_VARIANTS } from "./GameControls";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?:
		| ReactNode
		| ((props: {
				error: Error | null;
				resetErrorBoundary: () => void;
		  }) => ReactNode);
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		} else {
			console.error("ErrorBoundary caught an error:", error, errorInfo);
		}
	}

	resetErrorBoundary = (): void => {
		this.setState({ hasError: false, error: null });
	};

	render(): ReactNode {
		if (this.state.hasError) {
			if (typeof this.props.fallback === "function") {
				return this.props.fallback({
					error: this.state.error,
					resetErrorBoundary: this.resetErrorBoundary,
				});
			}

			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="max-w-[600px] w-full p-8 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] text-center mx-auto">
					<div className="w-12 h-12 mx-auto mb-4 text-red-500 flex items-center justify-center rounded-full bg-red-50">
						<svg
							className="w-6 h-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="2"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>

					<h2 className="text-xl font-bold text-gray-800 mb-2">
						Something went wrong
					</h2>
					<p className="text-gray-600 mb-6 text-sm">
						An unexpected error occurred while running the game.
						{this.state.error?.message && (
							<span className="block mt-2 font-mono text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
								{this.state.error.message}
							</span>
						)}
					</p>

					<div className="flex gap-3 justify-center">
						<button
							type="button"
							className={cn(BTN_BASE, BTN_VARIANTS.easy)}
							onClick={this.resetErrorBoundary}
						>
							Try Again
						</button>
						<button
							type="button"
							className={cn(BTN_BASE, BTN_VARIANTS.medium)}
							onClick={() => window.location.reload()}
						>
							Reload Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
