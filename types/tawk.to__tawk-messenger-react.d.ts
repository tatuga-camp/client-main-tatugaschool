declare module '@tawk.to/tawk-messenger-react' {
  interface TawkMessengerReactProps {
    propertyId: string;
    widgetId: string;
    customStyle?: {
      visibility?: {
        desktop?: {
          position?: string;
          xOffset?: string;
          yOffset?: string;
        };
        mobile?: {
          position?: string;
          xOffset?: string;
          yOffset?: string;
        };
      };
    };
  }

  export const TawkMessengerReact: React.FC<TawkMessengerReactProps>;
} 