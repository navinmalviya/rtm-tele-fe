'use client';

import { Suspense } from 'react';
import AssetsPage from '@/modules/assets';

export default function TestroomAssetsPage() {
	return (
		<Suspense fallback={null}>
			<AssetsPage scope="testroom" />
		</Suspense>
	);
}
