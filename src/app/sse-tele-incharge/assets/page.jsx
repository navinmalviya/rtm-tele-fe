'use client';

import { Suspense } from 'react';
import AssetsPage from '@/modules/assets';

export default function SseTeleInchargeAssetsPage() {
	return (
		<Suspense fallback={null}>
			<AssetsPage scope="field-engineer" />
		</Suspense>
	);
}
