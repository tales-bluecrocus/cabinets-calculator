import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { copyFileSync, mkdirSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		{
			name: "copy-images",
			closeBundle() {
				const srcDir = path.resolve(__dirname, "src/images");
				const destDir = path.resolve(__dirname, "dist/assets");
				mkdirSync(destDir, { recursive: true });

				const images = [
					"Lshape.webp",
					"Ushape.webp",
					"double.webp",
					"single.webp",
				];

				images.forEach((img) => {
					copyFileSync(
						path.join(srcDir, img),
						path.join(destDir, img)
					);
				});
			},
		},
	],
	base: "./",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: "dist",
		rollupOptions: {
			output: {
				entryFileNames: "assets/index.js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: "assets/[name].[ext]",
			},
		},
	},
	define: {
		"process.env": {},
	},
});
