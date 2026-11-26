/**
 * Клиентская часть self-hosted Matomo.
 *
 * Сам инстанс ставится отдельно на сервере:
 * https://matomo.org/faq/on-premise/installing-matomo/
 * Здесь только загрузка matomo.js и отправка данных в него.
 */

// Адрес инстанса Matomo — обязательно со слешем на конце.
const MATOMO_URL = 'https://stats.hermitage-map.ru/';
// Id сайта внутри Matomo (Администрирование → Сайты → Управление).
const MATOMO_SITE_ID = '2';

declare global {
	interface Window {
		_paq?: unknown[][];
	}
}

const isEnabled = () =>
	typeof window !== 'undefined' && Boolean(import.meta.env.QUASAR_PROD);

const push = (args: unknown[]) => {
	if (!isEnabled()) return;
	(window._paq = window._paq || []).push(args);
};

export const initMatomo = () => {
	if (!isEnabled()) return;

	push(['setTrackerUrl', MATOMO_URL + 'matomo.php']);
	push(['setSiteId', MATOMO_SITE_ID]);
	// Карта — это один экран надолго, без heartbeat время на странице = 0.
	push(['enableHeartBeatTimer', 15]);

	const first = document.getElementsByTagName('script')[0];
	const script = document.createElement('script');
	script.async = true;
	script.src = MATOMO_URL + 'matomo.js';
	first?.parentNode?.insertBefore(script, first);
};

// Предыдущий URL, чтобы у переходов внутри SPA был корректный referrer.
let lastUrl = '';

export const trackPageView = (url: string, title?: string) => {
	if (!isEnabled()) return;

	if (lastUrl) push(['setReferrerUrl', lastUrl]);
	push(['setCustomUrl', url]);
	if (title) push(['setDocumentTitle', title]);
	push(['trackPageView']);
	// DOM после смены роута новый — переподписываем отслеживание ссылок.
	push(['enableLinkTracking']);

	lastUrl = url;
};

export const trackEvent = (
	category: string,
	action: string,
	name?: string,
	value?: number,
) => {
	push(['trackEvent', category, action, name, value]);
};

export const trackSiteSearch = (keyword: string, resultsCount?: number) => {
	push(['trackSiteSearch', keyword, false, resultsCount]);
};
