'use client';

import WorkExecutionModule from '@/modules/work-execution';

export default function SseTeleInchargeWorkExecutionPage() {
	return (
		<WorkExecutionModule scope="field-engineer" mode="list" routeBasePath="/sse-tele-incharge" />
	);
}
