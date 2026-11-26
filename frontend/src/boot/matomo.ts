import { defineBoot } from '#q-app';
import { initMatomo, trackPageView } from '@/utils/matomo';

export default defineBoot(({ router }) => {
	if (typeof window === 'undefined') return;
	initMatomo();
});
