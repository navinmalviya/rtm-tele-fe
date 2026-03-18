'use client';

import { useParams } from 'next/navigation';
import CableDetailsPage from '@/modules/cable/cable-details-page';

export default function TestroomCableDetailPage() {
	const params = useParams();
	const cableId = Array.isArray(params?.cableId) ? params.cableId[0] : params?.cableId;

	return <CableDetailsPage cableId={cableId || null} />;
}
