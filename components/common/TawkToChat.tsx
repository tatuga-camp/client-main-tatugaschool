import { useEffect } from 'react';
import { School } from '../../interfaces/School';

interface TawkToChatProps {
  school: School;
}

const TawkToChat = ({ school }: TawkToChatProps) => {
  const TAWK_TO_PROPERTY_ID = process.env.TAWK_TO_PROPERTY_ID;
  const TAWK_TO_WIDGET_ID = process.env.TAWK_TO_WIDGET_ID;

  const shouldShowChat = school.plan === 'PREMIUM' || school.plan === 'ENTERPRISE';

  useEffect(() => {
    if (!shouldShowChat) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_TO_PROPERTY_ID}/${TAWK_TO_WIDGET_ID}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      const tawkIframe = document.getElementById('tawkto-container');
      if (tawkIframe) {
        tawkIframe.remove();
      }
    };
  }, [shouldShowChat]);

  if (!shouldShowChat) {
    return null;
  }

  return null;
};

export default TawkToChat; 