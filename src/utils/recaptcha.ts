// Stubbed helper: project uses reCAPTCHA v2 checkbox via RecaptchaV2 component.
// Keep a no-op API here so imports don't break; do NOT load v3 script.
export async function loadRecaptcha() {
  return false;
}

export async function getRecaptchaToken(_action = "signup") {
  return null;
}
