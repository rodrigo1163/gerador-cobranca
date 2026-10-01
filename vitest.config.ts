import { fileURLToPath } from 'node:url'
import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: [
			{
				find: '#test',
				replacement: fileURLToPath(new URL('./test', import.meta.url)),
			},
			{
				find: '#',
				replacement: fileURLToPath(new URL('./src', import.meta.url)),
			},
		],
		tsconfigPaths: true,
	},
	test: {
		globals: true,
		root: './',
	},
	plugins: [
		swc.vite({
			module: { type: 'es6' },
		}),
	],
})
