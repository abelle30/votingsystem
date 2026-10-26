import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
	...nextVitals,
	...nextTs,
	globalIgnores(['.next/**', 'node_modules/**', 'admin/**', 'admin2/**', 'candidates/**', 'register/**', 'js/**', 'font-awesome-4.1.0/**', 'fonts/**', 'css/**']),
]);
