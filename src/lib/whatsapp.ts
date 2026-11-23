export interface WhatsappSendResult {
  ok: boolean;
  error?: string;
}

export interface WhatsappProvider {
  send(to: string, icerik: string): Promise<WhatsappSendResult>;
}

class NoopProvider implements WhatsappProvider {
  async send() {
    return { ok: false, error: "WHATSAPP_PROVIDER yapılandırılmamış." };
  }
}

class WebhookProvider implements WhatsappProvider {
  constructor(private url: string) {}

  async send(to: string, icerik: string) {
    try {
      const res = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, icerik }),
      });
      if (!res.ok) {
        return { ok: false, error: `HTTP ${res.status}` };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String(error) };
    }
  }
}

export function getWhatsappProvider(): WhatsappProvider {
  const provider = process.env.WHATSAPP_PROVIDER;
  if (provider === "webhook" && process.env.WHATSAPP_WEBHOOK_URL) {
    return new WebhookProvider(process.env.WHATSAPP_WEBHOOK_URL);
  }
  return new NoopProvider();
}