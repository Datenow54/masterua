export interface DeviceAndroid {
  brand: string;
  model: string;
  name: string;
  os: string;
  build: string;
  scale: string;
  dpi?: string;
  resolution?: string;
  appBuildId?: string;
}

export interface DeviceApple {
  model: string;
  name: string;
  os: string;
  build: string;
  scale?: string;
  resolution?: string;
  appBuildId?: string;
}

export interface DeviceWindows {
  name: string;
  nt: string;
}

export interface Carrier {
  c: string; // Company / Carrier Name
  l: string; // Language / Locale
}

export interface UAHistoryItem {
  id: string;
  timestamp: string;
  platform: string;
  deviceCategory: string;
  ua: string;
  deviceName?: string;
  osVersion?: string;
  engineSpec?: string;
}

export interface UserSession {
  username: string;
  history: UAHistoryItem[];
}
