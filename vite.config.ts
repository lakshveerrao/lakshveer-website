import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwind from "@tailwindcss/vite"
import path from "path";

export default defineConfig({
	plugins: [react(), cloudflare(), tailwind()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/web"),
			"@intelligence": path.resolve(__dirname, "./src/intelligence"),
			"@agents": path.resolve(__dirname, "./src/agents"),
			"@experience": path.resolve(__dirname, "./src/experience"),
			"@core": path.resolve(__dirname, "./src/core"),
		},
	},
	server: {
		allowedHosts: true,
	}
});
