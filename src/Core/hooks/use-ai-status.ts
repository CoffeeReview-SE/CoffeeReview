import { useEffect, useState } from "react";
import { chatHealthUrl } from "@/Core/services/chat-api";

export function useAiStatus() {
  const [aiConnected, setAiConnected] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAiStatus = async () => {
      try {
        const response = await fetch(chatHealthUrl);
        const status = await response.json();
        if (active) setAiConnected(response.ok && status.aiConnected === true);
      } catch {
        if (active) setAiConnected(false);
      }
    };

    void checkAiStatus();
    const interval = setInterval(checkAiStatus, 30_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return aiConnected;
}
