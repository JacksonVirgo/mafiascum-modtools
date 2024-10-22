import path from 'path';
import fs from 'fs';

export async function loadScripts() {
	const rootDir = path.join(__dirname, '..', '..', 'features');
	const loadFiles = async (dirPath: string) => {
		const files = fs.readdirSync(dirPath);
		for (const file of files) {
			const filePath = path.join(dirPath, file);
			const stats = fs.statSync(filePath);
			if (stats.isDirectory()) {
				await loadFiles(filePath);
			} else if (
				stats.isFile() &&
				(file.endsWith('.ts') || file.endsWith('.js')) &&
				filePath.includes('/background/')
			) {
				try {
					const _ = import(filePath);
				} catch (err) {
					console.log(
						`\x1B[31mFailed to load file: \x1B[34m${file}\x1B[0m`,
					);
				}
			}
		}
	};

	await loadFiles(rootDir);
}
