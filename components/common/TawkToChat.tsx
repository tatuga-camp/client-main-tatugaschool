import { useEffect } from "react";
import { School } from "../../interfaces/School";
import { User } from "../../interfaces";

interface TawkToChatProps {
  school: School;
  user: User;
}

const TawkToChat = ({ school, user }: TawkToChatProps) => {
  const TAWK_TO_PROPERTY_ID = "67dade5ac029cf190fdd8c17";
  const TAWK_TO_WIDGET_ID = "1imnf9548";

  const shouldShowChat =
    school.plan === "FREE" ||
    school.plan === "PREMIUM" ||
    school.plan === "ENTERPRISE";

  useEffect(() => {
    if (!shouldShowChat) return;
    if (window.origin.includes("localhost:")) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_TO_PROPERTY_ID}/${TAWK_TO_WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);
    script.onload = () => {
      // Add a small delay to allow Tawk_API to fully initialize
      setTimeout(() => {
        if (window.Tawk_API) {
          window.Tawk_API.setAttributes(
            {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              userid: user.id,
              phone: user.phone,
              provider: user.provider,
            },
            function (error) {
              console.error("Tawk setAttributes Error:", error);
            }
          );
          window.Tawk_API.addTags([`School: ${school.id}`], function (error) {
            console.error("Tawk tag error:", error);
          });
        } else {
          console.error("Tawk_API still not available after script load.");
        }
      }, 3000);
    };

    return () => {
      document.body.removeChild(script);
      const tawkIframe = document.getElementById("tawkto-container");
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
