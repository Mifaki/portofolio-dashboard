import prettierPlugin from 'eslint-plugin-prettier';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
	{
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			'prettier/prettier': [
				'error',
				{
					endOfLine: 'auto',
					printWidth: 80,
				},
			],
		},
		ignores: [
			// dependencies
			'node_modules/**',
			'dist/**',

			// Nuxt
			'.nuxt/**',
			'.output/**',
			'.nitro/**',
			'.cache/**',

			// Coverage directory
			'coverage/**',

			// Logs
			'logs/**',
			'*.log',
			'npm-debug.log*',
			'yarn-debug.log*',
			'yarn-error.log*',

			// Editor directories and files
			'.idea/**',
			'.vscode/**',
			'*.suo',
			'*.ntvs*',
			'*.njsproj',
			'*.sln',
			'*.sw?',

			// System Files
			'.DS_Store',
			'Thumbs.db',

			// Optional
			'public/**',
			'static/**',
			'.github/**',
			'docs/**',
			'test/unit/coverage/**',
			'README.md',
		],
	},
	{
		files: ['**/*.ts', '**/*.vue', '**/*.js'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': 'off',
			'vue/multi-word-component-names': 'off',
			'vue/html-self-closing': 'off',
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		},
	}
);
