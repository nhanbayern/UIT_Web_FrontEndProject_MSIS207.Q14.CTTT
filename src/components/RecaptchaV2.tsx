import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

type RecaptchaRef = {
  getToken: () => string | null;
  reset: () => void;
};

const siteKey = (import.meta.env.VITE_CAPTCHA_SITE_KEY ||
  import.meta.env.CAPTCHA_SITE_KEY) as string;

function loadScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if ((window as any).grecaptcha) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js"; // v2 checkbox
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

const RecaptchaV2 = forwardRef<
  RecaptchaRef,
  { className?: string; theme?: "light" | "dark" }
>(({ className, theme = "light" }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.debug("[RecaptchaV2] siteKey=", siteKey);
    loadScript().then((ok) => {
      console.debug("[RecaptchaV2] script loaded ok=", ok);
      if (!mounted) return;
      if (!ok) {
        setReady(false);
        return;
      }
      // render widget
      try {
        const grecaptcha = (window as any).grecaptcha;
        console.debug("[RecaptchaV2] grecaptcha=", !!grecaptcha, grecaptcha);
        if (!siteKey) {
          console.warn(
            "[RecaptchaV2] no siteKey provided; please set VITE_CAPTCHA_SITE_KEY in FrontEnd/.env"
          );
          setReady(false);
          return;
        }
        if (grecaptcha && containerRef.current) {
          widgetIdRef.current = grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            theme,
          });
          console.debug("[RecaptchaV2] widgetId=", widgetIdRef.current);
          setReady(true);
        } else {
          setReady(false);
        }
      } catch (e) {
        console.error("[RecaptchaV2] render error", e);
        setReady(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [theme]);

  useImperativeHandle(ref, () => ({
    getToken: () => {
      const grecaptcha = (window as any).grecaptcha;
      if (!grecaptcha) return null;
      const id = widgetIdRef.current;
      if (id === null) return null;
      try {
        return grecaptcha.getResponse(id) || null;
      } catch (e) {
        return null;
      }
    },
    reset: () => {
      const grecaptcha = (window as any).grecaptcha;
      const id = widgetIdRef.current;
      if (grecaptcha && id !== null) grecaptcha.reset(id);
    },
  }));

  return (
    <div className={className}>
      <div ref={containerRef} />
      {!ready && (
        <div style={{ marginTop: 8, color: "#b45309", fontSize: 13 }}>
          {!siteKey
            ? "Captcha site key missing. Add VITE_CAPTCHA_SITE_KEY to FrontEnd/.env"
            : "Captcha chưa load (vui lòng kiểm tra trình chặn quảng cáo hoặc console để biết lý do)"}
        </div>
      )}
    </div>
  );
});

export default RecaptchaV2;
