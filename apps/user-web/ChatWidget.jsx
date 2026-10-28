import React, { useEffect, useRef, useState } from "react";

const styles = `
.sc-chat { position: fixed; z-index: 1200; right: 24px; bottom: 24px; }
.sc-chat-toggle { position: relative; width: 56px; height: 56px; display: grid; place-items: center; border: 0; border-radius: 50%; color: #fff; background: #273b2e; box-shadow: 0 8px 24px rgba(23,16,10,.3); cursor: pointer; transition: transform .18s, background .18s; }
.sc-chat-toggle:hover { transform: translateY(-2px); background: #35533e; }
.sc-chat-toggle[aria-expanded="true"] { background: #b87942; }
.sc-chat-dot { position: absolute; right: 1px; bottom: 1px; width: 14px; height: 14px; border: 2px solid #fff; border-radius: 50%; background: #dc3545; }
.sc-chat-dot.connected { background: #24a148; }
.sc-chat-panel { position: absolute; z-index: 1000; right: 0; bottom: calc(100% + 12px); width: min(344px, calc(100vw - 24px)); height: min(430px, calc(100dvh - 110px)); min-height: 280px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e8dfd4; border-radius: 16px; color: #30271f; background: #fffdf9; box-shadow: 0 18px 48px rgba(23,16,10,.24); text-align: left; }
.sc-chat-head { display: flex; align-items: center; gap: 10px; padding: 13px 14px; color: #fff; background: #273b2e; }
.sc-chat-avatar { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; color: #273b2e; background: #e6c7a4; }
.sc-chat-title { flex: 1; min-width: 0; }
.sc-chat-title strong { display: block; font-size: 14px; }
.sc-chat-title small { display: block; margin-top: 2px; color: #d8e2d7; font-size: 11px; }
.sc-chat-close { width: 30px; height: 30px; border: 0; border-radius: 8px; color: #fff; background: transparent; cursor: pointer; font-size: 21px; }
.sc-chat-close:hover { background: rgba(255,255,255,.13); }
.sc-chat-messages { flex: 1; display: flex; flex-direction: column; gap: 9px; overflow-y: auto; padding: 13px; background: #faf7f2; }
.sc-chat-bubble { max-width: 88%; padding: 9px 11px; border-radius: 13px; font-size: 13px; line-height: 1.45; white-space: pre-wrap; overflow-wrap: anywhere; }
.sc-chat-bubble.assistant { align-self: flex-start; border: 1px solid #eee6dc; border-bottom-left-radius: 4px; background: #fff; }
.sc-chat-bubble.user { align-self: flex-end; border-bottom-right-radius: 4px; color: #fff; background: #536c54; }
.sc-chat-status { align-self: flex-start; color: #766e66; font-size: 12px; }
.sc-chat-error { padding: 7px 10px; border-radius: 8px; color: #8f3429; background: #fff0ed; font-size: 12px; }
.sc-chat-form { display: flex; align-items: flex-end; gap: 8px; padding: 10px; border-top: 1px solid #eee6dc; background: #fff; }
.sc-chat-input { flex: 1; min-width: 0; min-height: 38px; max-height: 86px; resize: vertical; padding: 9px 10px; border: 1px solid #e1d8ce; border-radius: 10px; outline: none; color: #30271f; background: #fff; font: inherit; font-size: 13px; }
.sc-chat-input:focus { border-color: #8b6848; box-shadow: 0 0 0 2px rgba(139,104,72,.14); }
.sc-chat-send { width: 38px; height: 38px; display: grid; place-items: center; border: 0; border-radius: 10px; color: #fff; background: #536c54; cursor: pointer; }
.sc-chat-send:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 640px) { .sc-chat { right: 16px; bottom: 16px; } .sc-chat-panel { position: fixed; top: auto; right: 12px; bottom: 84px; width: min(344px, calc(100vw - 24px)); height: min(430px, calc(100dvh - 110px)); } }
`;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/assistant/status", { cache: "no-store" });
        const data = await response.json();
        if (active) setConnected(response.ok && data.connected === true);
      } catch {
        if (active) setConnected(false);
      }
    };
    checkConnection();
    const timer = window.setInterval(checkConnection, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }
  }, [open, messages, busy, error]);

  async function sendMessage(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busy) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || data.error || "Chatbot chưa thể trả lời lúc này.");
      setConnected(true);
      setMessages(current => [...current, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setConnected(false);
      setError(err.message || "Không thể kết nối chatbot.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <style>{styles}</style>
    <div className="sc-chat">
      <button className="sc-chat-toggle" type="button" aria-label={open ? "Đóng chatbot" : "Mở chatbot"} aria-expanded={open} title={connected ? "Chatbot đang kết nối" : "Chatbot chưa kết nối"} onClick={() => setOpen(value => !value)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {open ? <path d="m6 6 12 12M18 6 6 18" /> : <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>}
        </svg>
        <span className={`sc-chat-dot${connected ? " connected" : ""}`} aria-label={connected ? "Đang kết nối" : "Chưa kết nối"} />
      </button>

      {open && <section className="sc-chat-panel" role="dialog" aria-label="Trò chuyện với SaigonCoffee">
        <header className="sc-chat-head">
          <span className="sc-chat-avatar" aria-hidden="true">☕</span>
          <span className="sc-chat-title"><strong>SaigonCoffee</strong><small>{connected ? "Đang kết nối" : "Chưa kết nối"}</small></span>
          <button className="sc-chat-close" type="button" aria-label="Đóng chatbot" onClick={() => setOpen(false)}>×</button>
        </header>
        <div className="sc-chat-messages" ref={listRef} aria-live="polite">
          <div className="sc-chat-bubble assistant">Xin chào! Bạn đang muốn tìm quán cà phê như thế nào?</div>
          {messages.map((message, index) => <div className={`sc-chat-bubble ${message.role}`} key={`${index}-${message.role}`}>{message.content}</div>)}
          {busy && <span className="sc-chat-status">Đang soạn câu trả lời…</span>}
          {error && <div className="sc-chat-error" role="alert">{error}</div>}
        </div>
        <form className="sc-chat-form" onSubmit={sendMessage}>
          <textarea ref={inputRef} className="sc-chat-input" rows="1" maxLength="2000" placeholder="Nhập tin nhắn…" aria-label="Tin nhắn" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} />
          <button className="sc-chat-send" type="submit" aria-label="Gửi tin nhắn" disabled={busy || !draft.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
          </button>
        </form>
      </section>}
    </div>
  </>;
}
