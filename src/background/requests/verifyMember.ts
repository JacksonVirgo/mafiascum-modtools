import { load } from 'cheerio';

export async function verifyMember(username: string) {
	const fetchUrl = `https://forum.mafiascum.net/memberlist.php?username=${username}`;
	const response = await fetch(fetchUrl);
	const text = await response.text();
	const $ = load(text);
	const member = $('#memberlist > tbody > tr > td:nth-child(1) > a').first().text();
	return member === username;
}
