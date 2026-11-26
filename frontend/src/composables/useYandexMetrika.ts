import { trackEvent } from '@/utils/matomo';

export const useYandexMetrika = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const ymId = parseInt(import.meta.env.VITE_YM_ID)

  const reachGoal = (goalName: string) => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.ym) {
      // @ts-ignore
      ym(ymId, 'reachGoal', goalName)
      trackEvent('goal', goalName);
    }
  }

  return {
    reachGoal
  }
}
