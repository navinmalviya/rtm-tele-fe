export const openNativeDateTimePicker = (event) => {
	const input = event?.target;
	if (!input || typeof input.showPicker !== 'function') return;
	try {
		input.showPicker();
	} catch (_) {
		// Ignore browser restrictions (e.g. showPicker outside trusted interaction)
	}
};

