import fs from "fs";

// SudokuCell.tsx
let cellContent = fs.readFileSync("src/components/SudokuCell.tsx", "utf8");
cellContent = cellContent.replace(
	/"w-\[54px\] h-\[54px\] text-center text-\[1\.2rem\] border border-\[#bbb\] outline-none bg-\[#f9f9f9\] transition-colors duration-200 text-black",/g,
	'"w-[54px] h-[54px] text-center text-[1.2rem] border border-[#bbb] dark:border-slate-600 outline-none bg-[#f9f9f9] dark:bg-slate-800 transition-colors duration-200 text-black dark:text-slate-100",',
);
cellContent = cellContent.replace(
	/"focus:bg-blue-50 disabled:bg-\[#e0e0e0\] disabled:text-\[#333\] disabled:font-bold",/g,
	'"focus:bg-blue-50 dark:focus:bg-slate-700 disabled:bg-[#e0e0e0] dark:disabled:bg-slate-900 disabled:text-[#333] dark:disabled:text-slate-400 disabled:font-bold",',
);
cellContent = cellContent.replace(
	/border-r-\[#333\]"/g,
	'border-r-[#333] dark:border-r-slate-400"',
);
cellContent = cellContent.replace(
	/border-b-\[#333\]"/g,
	'border-b-[#333] dark:border-b-slate-400"',
);
cellContent = cellContent.replace(
	/border-t-\[#333\]"/g,
	'border-t-[#333] dark:border-t-slate-400"',
);
cellContent = cellContent.replace(
	/border-l-\[#333\]"/g,
	'border-l-[#333] dark:border-l-slate-400"',
);
cellContent = cellContent.replace(
	/!bg-\[#fff59d\] /g,
	"!bg-[#fff59d] dark:!bg-yellow-900/60 ",
);
cellContent = cellContent.replace(
	/focus:!bg-\[#fff176\]/g,
	"focus:!bg-[#fff176] dark:focus:!bg-yellow-800/60",
);
cellContent = cellContent.replace(
	/text-slate-600 bg-transparent border border-slate-300\/60 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-400/g,
	"text-slate-600 dark:text-slate-400 bg-transparent border border-slate-300/60 dark:border-slate-600/60 hover:border-slate-400 dark:hover:border-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-blue-400",
);
cellContent = cellContent.replace(
	/border border-blue-500\/25 bg-blue-50 text-blue-600/g,
	"border border-blue-500/25 dark:border-blue-500/50 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300",
);
fs.writeFileSync("src/components/SudokuCell.tsx", cellContent);

// SudokuBoard.tsx
let boardContent = fs.readFileSync("src/components/SudokuBoard.tsx", "utf8");
boardContent = boardContent.replace(
	/bg-white\/75/g,
	"bg-white/75 dark:bg-slate-900/75",
);
boardContent = boardContent.replace(
	/text-gray-700/g,
	"text-gray-700 dark:text-gray-300",
);
fs.writeFileSync("src/components/SudokuBoard.tsx", boardContent);

// CompletedDigits.tsx
let completedContent = fs.readFileSync(
	"src/components/CompletedDigits.tsx",
	"utf8",
);
completedContent = completedContent.replace(
	/text-gray-400/g,
	"text-gray-400 dark:text-slate-500",
);
fs.writeFileSync("src/components/CompletedDigits.tsx", completedContent);

// ErrorBoundary.tsx
let errorContent = fs.readFileSync("src/components/ErrorBoundary.tsx", "utf8");
errorContent = errorContent.replace(
	/bg-white rounded-xl shadow-\[0_2px_16px_rgba\(0,0,0,0\.08\)\]/g,
	"bg-white dark:bg-slate-800 rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)]",
);
errorContent = errorContent.replace(
	/bg-red-50/g,
	"bg-red-50 dark:bg-red-900/20",
);
errorContent = errorContent.replace(
	/text-red-500/g,
	"text-red-500 dark:text-red-400",
);
errorContent = errorContent.replace(
	/text-red-600/g,
	"text-red-600 dark:text-red-300",
);
errorContent = errorContent.replace(
	/border-red-100/g,
	"border-red-100 dark:border-red-900/50",
);
errorContent = errorContent.replace(
	/text-gray-800/g,
	"text-gray-800 dark:text-slate-100",
);
errorContent = errorContent.replace(
	/text-gray-600/g,
	"text-gray-600 dark:text-slate-400",
);
fs.writeFileSync("src/components/ErrorBoundary.tsx", errorContent);
