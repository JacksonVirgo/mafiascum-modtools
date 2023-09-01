// Semantic Types
type Username = string;
type PostNumber = number;

// I have absolutely no idea what to name this
export type GameDefinition = {
	url: string;
	players: Username[];
	aliases: Record<Username, Username[]>;
	replacements: Record<Username, Username[]>;
	ignoreFromUsers: Username[];
	ignoreFromPosts: PostNumber[];
	countFrom: PostNumber | undefined; // Post number to start counting from
	countUntil: PostNumber | undefined; // Post number to stop counting at
};
