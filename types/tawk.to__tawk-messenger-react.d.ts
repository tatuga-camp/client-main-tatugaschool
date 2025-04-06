interface TawkVisitor {
  name?: string;
  email?: string;
  hash?: string;
}

interface TawkCustomStyle {
  zIndex?: number | string;
}

interface TawkLoginData {
  hash: string;
  userId: string;
  name?: string | { first?: string; last?: string };
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface TawkAPIType {
  autoStart?: boolean;
  visitor: TawkVisitor;
  customStyle: TawkCustomStyle;

  start: (options?: { showWidget: boolean }) => void;
  shutdown: () => void;
  switchWidget: (
    data: { propertyId: string; widgetId: string },
    callback?: (error?: any) => void
  ) => void;
  login: (data: TawkLoginData, callback?: (error?: any) => void) => void;
  logout: (callback?: (error?: any) => void) => void;
  onLoad: () => void;
  onStatusChange: (status: "online" | "away" | "offline") => void;
  onBeforeLoad: () => void;
  onChatMaximized: () => void;
  onChatMinimized: () => void;
  onChatHidden: () => void;
  onChatStarted: () => void;
  onChatEnded: () => void;
  onPrechatSubmit: (data: any) => void;
  onOfflineSubmit: (data: any) => void;
  onChatMessageVisitor: (message: string) => void;
  onChatMessageAgent: (message: string) => void;
  onChatMessageSystem: (message: string) => void;
  onAgentJoinChat: (data: {
    name: string;
    position: string;
    image: string;
    id: string;
  }) => void;
  onAgentLeaveChat: (data: { name: string; id: string }) => void;
  onChatSatisfaction: (satisfaction: -1 | 0 | 1) => void;
  onVisitorNameChanged: (visitorName: string) => void;
  onFileUpload: (link: string) => void;
  onTagsUpdated: (data: any) => void;
  maximize: () => void;
  minimize: () => void;
  toggle: () => void;
  popup: () => void;
  getWindowType: () => "inline" | "embed";
  showWidget: () => void;
  hideWidget: () => void;
  toggleVisibility: () => void;
  getStatus: () => "online" | "away" | "offline";
  isChatMaximized: () => boolean;
  isChatMinimized: () => boolean;
  isChatHidden: () => boolean;
  isChatOngoing: () => boolean;
  isVisitorEngaged: () => boolean;
  endChat: () => void;
  setAttributes: (
    attributes: Record<string, any>,
    callback?: (error?: any) => void
  ) => void;
  addEvent: (
    eventName: string,
    metadata?: Record<string, any>,
    callback?: (error?: any) => void
  ) => void;
  addTags: (tags: string[], callback?: (error?: any) => void) => void;
  removeTags: (tags: string[], callback?: (error?: any) => void) => void;
}

interface Window {
  Tawk_API: TawkAPIType;
  Tawk_LoadStart?: Date;
}
