import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  View,
  Button,
  TextInput,
  FlatList,
} from "react-native";
// import { FlatList, TextInput } from "react-native-web";

const GEMINI_API_KEY = "";
export default function App() {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState([]);

  async function sendPrompt() {
    if (!prompt.trim()) return;
    setLoading(true);

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "No response";

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: aiText,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          text: "Error in fetching response",
        },
      ]);
    } finally {
      setLoading(false);
      setPrompt("");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Flatlist */}
      <FlatList
        data={messages}
        keyExtractor={(msg) => msg.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Type your prompt..."
        />
        <Button title="Send" onPress={sendPrompt} disabled={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 24,
  },
  inputRow: {
    flexDirection: "row",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "black",
  },
  list: {
    paddingBottom: 16,
  },
  bubble: {
    marginVertical: 4,
    padding: 8,
    borderRadius: 8,
    maxWidth: "80%",
  },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#dcf8c6" },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#ececec" },
  bubbleText: { fontSize: 16 },
});
