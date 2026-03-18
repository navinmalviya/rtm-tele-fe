'use client';

import { useParams } from 'next/navigation';
import WorkExecutionModule from '@/modules/work-execution';

export default function TestroomWorkExecutionDetailPage() {
	const params = useParams();
	const workId = Array.isArray(params?.workId) ? params.workId[0] : params?.workId;

	return <WorkExecutionModule scope="testroom" mode="detail" workId={workId || null} />;
}
