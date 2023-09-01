// I have absolutely no idea what to name this
export type GameDefinition = {
	url: string;
	players: string[];
	aliases: Record<string, string[]>;
	replacements: Record<string, string[]>;
	ignoreFromUsers: string[];
	ignoreFromPosts: number[];
};
