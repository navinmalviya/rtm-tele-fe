'use client';

import { Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import RtmLoader from '@/lib/common/loader';

export default function CableDetailRoute() {
	const params = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();
	const cableId = Array.isArray(params?.cableId) ? params.cableId[0] : params?.cableId;

	useEffect(() => {
		if (!cableId || status === 'loading') return;

		const role = session?.user?.role;
		let basePath = '/testroom';

		if (role === 'SSE_TELE_INCHARGE') {
			basePath = '/sse-tele-incharge';
		} else if (
			['FIELD_ENGINEER', 'JE_SSE_TELE_SECTIONAL', 'JE_SECTIONAL', 'SSE_SECTIONAL'].includes(role)
		) {
			basePath = '/field-engineer';
		}

		router.replace(`${basePath}/cable/${cableId}`);
	}, [cableId, router, session?.user?.role, status]);

	return (
		<Box sx={{ minHeight: '40vh' }}>
			<RtmLoader
				variant="inline"
				label="Opening cable details..."
				sx={{ justifyContent: 'center', pt: 12 }}
			/>
		</Box>
	);
}
