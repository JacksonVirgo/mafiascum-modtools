import $ from 'jquery';

export default () => {
	const activityOverviewUrl =
		'https://forum.mafiascum.net/app.php/activity_overview/';
	if (window.location.href.startsWith(activityOverviewUrl)) {
		const threadNum = window.location.href.split(activityOverviewUrl)[1]; // Dodgy but oh well

		const fieldset = $('#page-body > form > fieldset');
		const button = fieldset.children('input').first().clone();
		button.val('Multi-ISO Selected');
		button.attr('type', 'button');
		button.on('click', () => {
			const selectedUserIDs: string[] = [];
			$('#page-body > form > table > tbody > tr').each(
				(_index, element) => {
					const checkbox = $(element)
						.find('td:nth-child(1) > input[type=checkbox]')
						.first();
					if (checkbox.prop('checked')) {
						const usernameURL = $(element)
							.find('td:nth-child(2) > a')
							.first()
							.attr('href');
						if (usernameURL) {
							const urlParams = new URLSearchParams(
								usernameURL.split('?')[1],
							);
							const userID = urlParams.get('u');
							if (userID) selectedUserIDs.push(userID);
						}
					}
				},
			);

			let newURL = `https://forum.mafiascum.net/viewtopic.php?t=${threadNum}`;
			selectedUserIDs.forEach((userID) => {
				newURL += `&user_select%5B%5D=${userID}`;
			});

			window.location.href = newURL;
		});
		fieldset.append(button);
	}
};
