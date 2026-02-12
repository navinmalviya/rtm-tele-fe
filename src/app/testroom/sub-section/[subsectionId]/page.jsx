'use client';

import { useParams } from 'next/navigation';
import SubSectionDetails from '@/modules/sub-sections/sub-section-details';

export default function SubSection() {
	const params = useParams();
	const { subsectionId } = params;
	return <SubSectionDetails subsectionId={subsectionId} />;
}
