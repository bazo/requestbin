import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '..', '')

	return {
		envDir: "..",
		plugins: [tailwindcss(), react()],
		server: {
			proxy: {
				"/api": env.VITE_API_URL ?? "http://localhost:8100",
			},
		},
	}
})
