// Semantic Types
type Username = string;
type PostNumber = number;

// I have absolutely no idea what to name this
export type GameDefinition = {
	players: Username[];
	aliases?: Record<Username, Username[]>;
	replacements?: Record<Username, Username[]>;
	ignore?: Username[];
};

export type ValidationResult = {
	isValid: boolean;
	errors: string[];
};

function isGameDefinition(obj: unknown): obj is GameDefinition {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	const gameDef = obj as GameDefinition;

	if (!Array.isArray(gameDef.players) || gameDef.players.length === 0) {
		return false;
	}

	// Check 'aliases' if it exists
	if (gameDef.aliases) {
		if (typeof gameDef.aliases !== 'object') {
			return false;
		}
		for (const username in gameDef.aliases) {
			if (!Array.isArray(gameDef.aliases[username])) {
				return false;
			}
		}
	}

	// Check 'replacements' if it exists
	if (gameDef.replacements) {
		if (typeof gameDef.replacements !== 'object') {
			return false;
		}
		for (const username in gameDef.replacements) {
			if (!Array.isArray(gameDef.replacements[username])) {
				return false;
			}
		}
	}

	// Check 'ignore' if it exists
	if (gameDef.ignore) {
		if (!Array.isArray(gameDef.ignore)) {
			return false;
		}
	}

	return true;
}

export function validateGameDefinition(obj: unknown): GameDefinition | null {
	if (!isGameDefinition(obj)) return null;
	const gameDef = obj;

	return {
		players: gameDef.players.slice(),
		aliases: gameDef.aliases ? { ...gameDef.aliases } : undefined,
		replacements: gameDef.replacements ? { ...gameDef.replacements } : undefined,
		ignore: gameDef.ignore ? gameDef.ignore.slice() : undefined,
	};
}
