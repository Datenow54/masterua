import { DeviceAndroid, DeviceApple, DeviceWindows, Carrier } from './types';

export const androidPool: DeviceAndroid[] = [
  { brand: "Samsung", model: "SM-S928B", name: "S24 Ultra", os: "14", build: "UP1A.231005.007", scale: "3.0", dpi: "480dpi", resolution: "1440x3120" },
  { brand: "Samsung", model: "SM-S938B", name: "S25 Ultra", os: "15", build: "VP1A.241005.001", scale: "3.0", dpi: "480dpi", resolution: "1440x3120" },
  { brand: "Xiaomi", model: "23127PN0CC", name: "Xiaomi 14 Pro", os: "14", build: "UKQ1.230804.001", scale: "3.0", dpi: "480dpi", resolution: "1440x3200" },
  { brand: "Google", model: "Pixel 9 Pro", name: "Pixel 9 Pro", os: "15", build: "AD1A.240511.001", scale: "3.5", dpi: "560dpi", resolution: "1344x2992" },
  { brand: "OnePlus", model: "CPH2581", name: "OnePlus 12", os: "14", build: "UKQ1.230917.001", scale: "3.0", dpi: "480dpi", resolution: "1440x3168" },
  { brand: "Vivo", model: "V2303", name: "Vivo V29", os: "13", build: "TP1A.220624.014", scale: "2.7", dpi: "420dpi", resolution: "1260x2800" }
];

export const iosPool: DeviceApple[] = [
  { model: "iPhone17,1", name: "iPhone 16 Pro Max", os: "18.3.1", build: "23D8133", scale: "3.00", resolution: "1320x2868", appBuildId: "911230482" },
  { model: "iPhone17,4", name: "iPhone 16 Pro", os: "18.3.2", build: "22D89", scale: "3.00", resolution: "1290x2796", appBuildId: "752213847" },
  { model: "iPhone15,3", name: "iPhone 14 Pro Max", os: "16.7.5", build: "20H341", scale: "3.00", resolution: "1290x2796", appBuildId: "612458921" },
  { model: "iPhone16,2", name: "iPhone 15 Pro", os: "17.4", build: "21E219", scale: "3.00", resolution: "1179x2556", appBuildId: "587932145" },
  { model: "iPhone17,2", name: "iPhone 16 Plus", os: "18.2.1", build: "22C152", scale: "3.00", resolution: "1290x2796", appBuildId: "812493012" },
  { model: "iPhone18,2", name: "iPhone 17 Ultra", os: "19.0", build: "23A567", scale: "3.00", resolution: "1320x2868", appBuildId: "921832045" }
];

export const winPool: DeviceWindows[] = [
  { name: "Windows 8.1", nt: "Windows NT 6.3" },
  { name: "Windows 10", nt: "Windows NT 10.0" },
  { name: "Windows 11", nt: "Windows NT 10.0" }
];

export const carriers: Carrier[] = [
  { c: "Grameenphone", l: "bn_BD" },
  { c: "Verizon", l: "en_US" }, 
  { c: "Jio", l: "hi_IN" }, 
  { c: "Airtel", l: "en_IN" },
  { c: "T-Mobile", l: "de_DE" }, 
  { c: "Orange", l: "fr_FR" }
];

export interface UAItem {
  id: string;
  ua: string;
  platform: string;
  category: string;
}
