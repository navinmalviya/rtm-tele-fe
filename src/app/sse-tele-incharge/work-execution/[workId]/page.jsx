'use client';

import { useParams } from 'next/navigation';
import WorkExecutionModule from '@/modules/work-execution';

export default function SseTeleInchargeWorkExecutionDetailPage() {
	const params = useParams();
	const workId = Array.isArray(params?.workId) ? params.workId[0] : params?.workId;

	return (
		<WorkExecutionModule
			scope="field-engineer"
			mode="detail"
			workId={workId || null}
			routeBasePath="/sse-tele-incharge"
		/>
	);
}
