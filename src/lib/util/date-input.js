export const openNativeDateTimePicker = (event) => {
	const target = event?.target;
	const currentTarget = event?.currentTarget;

	const inputFromTarget =
		target instanceof HTMLInputElement
			? target
			: target?.closest?.('input[type="date"], input[type="datetime-local"]');
	const inputFromCurrentTarget =
		currentTarget?.querySelector?.('input[type="date"], input[type="datetime-local"]') || null;
	const input = inputFromTarget || inputFromCurrentTarget;

	if (!input || typeof input.showPicker !== 'function') return;

	try {
		input.focus();
		input.showPicker();
	} catch (_) {
		// Ignore browser restrictions (e.g. showPicker outside trusted interaction)
	}
};
