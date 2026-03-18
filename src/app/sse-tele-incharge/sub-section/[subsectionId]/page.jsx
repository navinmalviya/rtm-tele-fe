'use client';

import { useParams } from 'next/navigation';
import SubSectionDetails from '@/modules/sub-sections/sub-section-details';

export default function SseTeleInchargeSubSectionPage() {
	const params = useParams();
	const { subsectionId } = params;
	return <SubSectionDetails subsectionId={subsectionId} routeBasePath="/sse-tele-incharge" />;
}
