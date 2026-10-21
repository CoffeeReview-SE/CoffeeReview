import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { chatApiUrl } from "@/Core/services/chat-api";
import { AiStatusBadge } from "@/Core/components/ai-status-badge";
import { useAiStatus } from "@/Core/hooks/use-ai-status";

type Source = { title: string; url: string };
type Message = { id: string; role: "user" | "assistant"; content: string; sources?: Source[] };
const suggestions = ["Thông tin iPhone 16", "So sánh iPhone và Samsung mới nhất", "Tư vấn laptop cho sinh viên"];

export default function ChatScreen() {
  const aiConnected = useAiStatus();
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", content: "Xin chào! Bạn có thể hỏi mình về thông tin, cấu hình hoặc so sánh sản phẩm. Mình sẽ tìm thông tin trực tuyến và đính kèm nguồn tham khảo." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const list = useRef<FlatList<Message>>(null);
  const messageCounter = useRef(0);
  useEffect(() => { list.current?.scrollToEnd({ animated: true }); }, [messages, loading]);

  async function sendMessage(text = input) {
    const question = text.trim();
    if (!question || loading) return;
    messageCounter.current += 1;
    const userMessage: Message = { id: `user-${messageCounter.current}`, role: "user", content: question };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch(chatApiUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history.filter((message) => message.id !== "welcome").map(({ role, content }) => ({ role, content })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể xử lý câu hỏi lúc này.");
      setMessages((current) => [...current, { id: `answer-${messageCounter.current}`, role: "assistant", content: data.answer, sources: data.sources || [] }]);
    } catch (error) {
      const message = error instanceof TypeError ? "Không kết nối được backend. Kiểm tra backend đang chạy và EXPO_PUBLIC_CHAT_API_URL trỏ đúng địa chỉ máy chủ." : (error as Error).message;
      setMessages((current) => [...current, { id: `error-${messageCounter.current}`, role: "assistant", content: message }]);
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/")} style={styles.back} accessibilityLabel="Quay lại"><Ionicons name="arrow-back" size={24} color="#172033" /></Pressable>
        <View style={styles.heading}><Text style={styles.title}>Trợ lý sản phẩm</Text><Text style={styles.subtitle}>Tìm kiếm thông tin trên web</Text></View>
        <AiStatusBadge connected={aiConnected} />
      </View>
      <FlatList ref={list} data={messages} keyExtractor={(item) => item.id} contentContainerStyle={styles.messages} renderItem={({ item }) => (
        <View style={[styles.row, item.role === "user" && styles.userRow]}>
          {item.role === "assistant" && <View style={styles.avatar}><Ionicons name="sparkles" size={18} color="white" /></View>}
          <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.messageText, item.role === "user" && styles.userText]}>{item.content}</Text>
            {!!item.sources?.length && <View style={styles.sources}><Text style={styles.sourceHeading}>Nguồn tham khảo</Text>{item.sources.map((source) => <Pressable key={source.url} onPress={() => Linking.openURL(source.url)}><Text style={styles.sourceLink}>• {source.title}</Text></Pressable>)}</View>}
          </View>
        </View>
      )} ListFooterComponent={loading ? <View style={styles.loading}><ActivityIndicator color="#df2445" /><Text style={styles.loadingText}>Đang tìm thông tin…</Text></View> : null} />
      <View style={styles.composerArea}>
        <View style={styles.suggestions}>{suggestions.map((item) => <Pressable key={item} onPress={() => sendMessage(item)} style={styles.suggestion}><Text style={styles.suggestionText}>{item}</Text></Pressable>)}</View>
        <View style={styles.composer}><TextInput value={input} onChangeText={setInput} placeholder="Hỏi về sản phẩm..." multiline maxLength={2000} style={styles.input} placeholderTextColor="#8190a8" onSubmitEditing={() => sendMessage()} returnKeyType="send" />
          <Pressable onPress={() => sendMessage()} disabled={!input.trim() || loading} style={[styles.send, (!input.trim() || loading) && styles.sendDisabled]} accessibilityLabel="Gửi câu hỏi"><Ionicons name="arrow-up" size={24} color="white" /></Pressable>
        </View>
        <Text style={styles.note}>Thông tin giá và tình trạng hàng trên web có thể thay đổi.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f6fa", maxWidth: 1125, width: "100%", alignSelf: "center" },
  header: { minHeight: 78, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#e2e6ee", flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 14 },
  back: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#f2f4f8", alignItems: "center", justifyContent: "center" }, heading: { flex: 1 }, title: { fontWeight: "700", color: "#172033", fontSize: 19 }, subtitle: { color: "#73809a", marginTop: 3 },
  messages: { padding: 18, gap: 18, flexGrow: 1, justifyContent: "flex-end" }, row: { flexDirection: "row", alignItems: "flex-end", gap: 10 }, userRow: { justifyContent: "flex-end" }, avatar: { width: 35, height: 35, borderRadius: 18, backgroundColor: "#df2445", alignItems: "center", justifyContent: "center" }, bubble: { maxWidth: "86%", padding: 15, borderRadius: 20 }, assistantBubble: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e9f1", borderBottomLeftRadius: 7 }, userBubble: { backgroundColor: "#df2445", borderBottomRightRadius: 7 }, messageText: { color: "#18243a", fontSize: 16, lineHeight: 24 }, userText: { color: "white" },
  sources: { borderTopWidth: 1, borderTopColor: "#e7eaf0", marginTop: 12, paddingTop: 10, gap: 6 }, sourceHeading: { fontSize: 13, fontWeight: "700", color: "#5d6880" }, sourceLink: { color: "#315da8", fontSize: 13 }, loading: { flexDirection: "row", alignItems: "center", gap: 9, marginLeft: 45 }, loadingText: { color: "#68758c" },
  composerArea: { backgroundColor: "#f5f6fa", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }, suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }, suggestion: { backgroundColor: "white", borderRadius: 22, borderWidth: 1, borderColor: "#dce2ec", paddingVertical: 9, paddingHorizontal: 13 }, suggestionText: { color: "#586783", fontSize: 13 }, composer: { minHeight: 80, borderRadius: 22, borderWidth: 1, borderColor: "#dce2ec", backgroundColor: "white", padding: 10, flexDirection: "row", alignItems: "center", gap: 10 }, input: { flex: 1, minHeight: 54, maxHeight: 120, color: "#172033", fontSize: 16, padding: 5, outlineWidth: 0, outlineStyle: "none" } as never, send: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#df2445", alignItems: "center", justifyContent: "center" }, sendDisabled: { opacity: 0.45 }, note: { textAlign: "center", color: "#8691a5", fontSize: 12, marginTop: 9 },
});
