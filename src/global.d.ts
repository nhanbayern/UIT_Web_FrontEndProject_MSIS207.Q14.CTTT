declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_IMG_URL?: string;
  readonly VITE_CAPTCHA_SITE_KEY?: string;
  readonly CAPTCHA_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
