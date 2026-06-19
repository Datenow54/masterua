import { androidPool, iosPool, winPool, carriers } from '../data';
import { DeviceAndroid, DeviceApple, DeviceWindows, Carrier } from '../types';

// Helper to get a random integer in a closed range [min, max]
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Returns a random element from an array
export const getRandomElement = <T>(arr: T[]): T => {
  return arr[getRandomInt(0, arr.length - 1)];
};

export interface GenerateParams {
  platform: string;       // 'CHROME' | 'FIREFOX' | 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK'
  deviceCategory: string; // 'MOBILE' | 'IOS' | 'WINDOWS'
  customChromeVer?: string; // Optional manual override (e.g., '147.0.6200.12')
  customFirefoxVer?: string; // Optional manual override
  customDeviceName?: string; // Named device override
  customCarrier?: Carrier;   // Custom Carrier info
}

export function generateUA(params: GenerateParams): { ua: string; deviceName: string; osVersion: string; engineSpec: string } {
  const { platform, deviceCategory, customChromeVer, customFirefoxVer } = params;

  let ua = "";
  let deviceName = "";
  let osVersion = "";
  let engineSpec = "";

  // 1. Generate version tokens
  const chromeVer = customChromeVer || `${getRandomInt(133, 148)}.0.${getRandomInt(6000, 7100)}.${getRandomInt(10, 199)}`;
  const firefoxVer = customFirefoxVer || `${getRandomInt(133, 143)}.0`;
  const fbVer = "553.0.0"; // Matching user's authentic high-tier Facebook app version
  const fbbv = getRandomInt(911000000, 915999999);
  const carrier = params.customCarrier || getRandomElement(carriers);

  if (deviceCategory === "MOBILE") {
    // Android device category
    const dev = androidPool.find(d => d.name === params.customDeviceName) || getRandomElement(androidPool);
    deviceName = `${dev.brand} ${dev.name} (${dev.model})`;
    osVersion = `Android ${dev.os}`;
    engineSpec = platform === 'FIREFOX' ? `Gecko/${firefoxVer}` : `AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer}`;

    if (platform === "CHROME") {
      ua = `Mozilla/5.0 (Linux; Android ${dev.os}; ${dev.model}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Mobile Safari/537.36`;
    } else if (platform === "FIREFOX") {
      ua = `Mozilla/5.0 (Android ${dev.os}; Mobile; rv:${firefoxVer}) Gecko/${firefoxVer} Firefox/${firefoxVer}`;
    } else if (platform === "FACEBOOK") {
      ua = `Mozilla/5.0 (Linux; Android ${dev.os}; ${dev.model} Build/${dev.build}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/${chromeVer} Mobile Safari/537.36 [FBAN/FB4A;FBAV/${fbVer};FBBV/${dev.appBuildId || '911230482'};FBDV/${dev.model};FBMD/${dev.brand};FBSN/Android;FBSV/${dev.os};FBSS/${parseFloat(dev.scale).toFixed(1)};FBCR/${carrier.c};FBLC/${carrier.l};FBOP/19;FBRV/${fbbv}]`;
    } else if (platform === "INSTAGRAM") {
      ua = `Instagram 421.1.0 Android (${dev.os}/${dev.build}; ${dev.dpi || '480dpi'}; ${dev.resolution || '1080x2340'}; ${dev.brand}; ${dev.model}; ${dev.model}; ${carrier.l}; en_US; ${dev.appBuildId || '752213847'})`;
    } else if (platform === "TIKTOK") {
      ua = `Mozilla/5.0 (Linux; Android ${dev.os}; ${dev.model} Build/${dev.build}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/${chromeVer} Mobile Safari/537.36 TikTok/38.5.4`;
    }
  } else if (deviceCategory === "IOS") {
    // Apple / iOS device category
    const dev = iosPool.find(d => d.name === params.customDeviceName) || getRandomElement(iosPool);
    deviceName = `${dev.name} (${dev.model})`;
    osVersion = `iOS ${dev.os}`;
    
    const parsedOS = dev.os.replace(/\./g, '_');
    engineSpec = platform === 'FIREFOX' ? `Gecko/${firefoxVer}` : `AppleWebKit/605.1.15 (KHTML, like Gecko)`;

    if (platform === "FACEBOOK") {
      ua = `Mozilla/5.0 (iPhone; CPU iPhone OS ${parsedOS} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/${dev.build} Safari/604.1 [FBAN/FBIOS;FBAV/553.0.0;FBBV/${dev.appBuildId || '911230482'};FBDV/${dev.model};FBMD/iPhone;FBSN/iOS;FBSV/${dev.os};FBSS/3;FBID/phone;FBLC/${carrier.l};FBOP/5;FBRV/${fbbv};IABMV/1]`;
    } else if (platform === "FIREFOX") {
      ua = `Mozilla/5.0 (iPhone; CPU iPhone OS ${parsedOS} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/${firefoxVer} Mobile/15E148 Safari/605.1.15`;
    } else if (platform === "INSTAGRAM") {
      ua = `Mozilla/5.0 (iPhone; CPU iPhone OS ${parsedOS} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/${dev.build} Instagram 421.1.0 (${dev.model}; iOS ${parsedOS}; ${carrier.l}; en; scale=${parseFloat(dev.scale || '3').toFixed(2)}; ${dev.resolution || '1290x2796'}; ${dev.appBuildId || '752213847'}; IABMV/1)`;
    } else if (platform === "TIKTOK") {
      ua = `Mozilla/5.0 (iPhone; CPU iPhone OS ${parsedOS} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) TikTok/38.5.4 (iOS ${dev.os}; ${carrier.l})`;
    } else {
      // Chrome/Safari on iOS
      if (platform === "CHROME") {
        ua = `Mozilla/5.0 (iPhone; CPU iPhone OS ${parsedOS} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/${chromeVer} Mobile/15E148 Safari/604.1`;
      } else {
        ua = `Mozilla/5.0 (iPhone; CPU iPhone OS ${parsedOS} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1`;
      }
    }
  } else {
    // Windows device category (Simulated setups or high fidelity developer desktop web header stacks)
    const dev = winPool.find(d => d.name === params.customDeviceName) || getRandomElement(winPool);
    deviceName = dev.name;
    osVersion = dev.nt;
    engineSpec = platform === 'FIREFOX' ? `Gecko/${firefoxVer}` : `AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer}`;

    if (platform === "FIREFOX") {
      ua = `Mozilla/5.0 (${dev.nt}; Win64; x64; rv:${firefoxVer}) Gecko/20100101 Firefox/${firefoxVer}`;
    } else if (platform === "FACEBOOK") {
      ua = `Mozilla/5.0 (${dev.nt}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36 [FBAN/FBWin;FBAV/553.0.0;FBBV/911230482;FBLC/${carrier.l}]`;
    } else if (platform === "INSTAGRAM") {
      ua = `Mozilla/5.0 (${dev.nt}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36 InstagramWeb/421.1.0`;
    } else if (platform === "TIKTOK") {
      ua = `Mozilla/5.0 (${dev.nt}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36 TikTokWeb/38.5.4`;
    } else {
      // Chrome
      ua = `Mozilla/5.0 (${dev.nt}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVer} Safari/537.36`;
    }
  }

  return {
    ua,
    deviceName,
    osVersion,
    engineSpec
  };
}

export interface UASegment {
  text: string;
  type: 'prefix' | 'system' | 'engine' | 'browser' | 'app' | 'raw';
  description: string;
}

// Breaks a generated user-agent down into dynamic tokens with diagnostic metadata descriptions
export function parseUASegments(ua: string): UASegment[] {
  const segments: UASegment[] = [];
  
  // 1. Match common tokens
  if (ua.startsWith("Mozilla/5.0")) {
    segments.push({
      text: "Mozilla/5.0",
      type: "prefix",
      description: "Standard browser baseline prefix used for modern web compatibility."
    });
  }

  // Bracket detection for system info
  const systemMatch = ua.match(/\(([^)]+)\)/);
  if (systemMatch) {
    const fullBracket = systemMatch[0]; // (Linux; Android 15; ...)
    const content = systemMatch[1];
    
    segments.push({
      text: fullBracket,
      type: "system",
      description: `Target System OS Architecture info: [${content}]`
    });
  }

  // Engine detection (AppleWebKit or Gecko info)
  const appleWebkitMatch = ua.match(/AppleWebKit\/[0-9.]+/);
  if (appleWebkitMatch) {
    segments.push({
      text: ` ${appleWebkitMatch[0]} (KHTML, like Gecko)`,
      type: "engine",
      description: "Rendering engine rendering layout elements seamlessly."
    });
  } else {
    const geckoMatch = ua.match(/Gecko\/[0-9.]+/);
    if (geckoMatch) {
      segments.push({
        text: ` ${geckoMatch[0]}`,
        type: "engine",
        description: "Gecko rendering engine used in Mozilla Firefox browsers."
      });
    }
  }

  // Chrome or Firefox version match
  const chromeMatch = ua.match(/Chrome\/[0-9.]+/);
  const firefoxMatch = ua.match(/Firefox\/[0-9.]+/);
  const fxIosMatch = ua.match(/FxiOS\/[0-9.]+/);
  const safariMatch = ua.match(/Safari\/[0-9.]+/);

  if (chromeMatch) {
    segments.push({
      text: ` ${chromeMatch[0]}`,
      type: "browser",
      description: `Chrome browser version token driving modern features.`
    });
  } else if (fxIosMatch) {
    segments.push({
      text: ` ${fxIosMatch[0]}`,
      type: "browser",
      description: "Firefox engine for iOS (FxiOS) wrapper implementation token."
    });
  } else if (firefoxMatch) {
    segments.push({
      text: ` ${firefoxMatch[0]}`,
      type: "browser",
      description: `Mozilla Firefox independent browser release token.`
    });
  }

  if (safariMatch && !chromeMatch) {
    segments.push({
      text: ` ${safariMatch[0]}`,
      type: "browser",
      description: "Apple Safari rendering compliance tag."
    });
  }

  // App wrappers (Facebook, Instagram, TikTok, etc.)
  const bracketsConfig = ua.includes("[FBAN/") || ua.includes("[FBIOS;");
  if (bracketsConfig) {
    const fbToken = ua.substring(ua.indexOf("["));
    segments.push({
      text: ` ${fbToken}`,
      type: "app",
      description: "Facebook App Native internal context packet (Build, locale, and screen ratio tags)."
    });
  } else if (ua.startsWith("Instagram")) {
    const mainToken = ua.substring(ua.indexOf("(") - 1);
    segments.push({
      text: ` ${mainToken}`,
      type: "app",
      description: "Instagram App native environment config wrapper token."
    });
  } else if (ua.includes("TikTok/")) {
    const tkMatch = ua.match(/TikTok\/[0-9.]+/);
    if (tkMatch) {
      segments.push({
        text: ` ${tkMatch[0]}`,
        type: "app",
        description: "TikTok ByteDance internal mobile compilation build-ID."
      });
    }
  }

  // If no parts matched clearly, return the raw UA split up dynamically as raw blocks
  if (segments.length === 0) {
    segments.push({
      text: ua,
      type: 'raw',
      description: 'Raw target user-agent code sequence.'
    });
  }

  return segments;
}
