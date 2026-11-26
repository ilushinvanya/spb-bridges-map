/**
 * Композбл для отправки целей в Яндекс Метрику
 */
export const useYandexMetrika = () => {
  const ymId = parseInt(import.meta.env.VITE_YM_ID)

  const reachGoal = (goalName: string) => {
    if (typeof window !== 'undefined' && window.ym) {
      ym(ymId, 'reachGoal', goalName)
    }
  }

  return {
    reachGoal
  }
}
