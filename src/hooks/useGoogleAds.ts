declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const useGoogleAds = () => {
  const trackConversion = (conversionId: string) => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': `AW-960025532/${conversionId}`
      });
    }
  };

  return { trackConversion };
};