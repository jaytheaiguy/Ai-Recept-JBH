import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Bot, User, PhoneOff } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import { PRE_SCREEN_SYSTEM_INSTRUCTION } from '../lib/gemini';
import { Message } from '../types';

interface AICallSimulatorProps {
  onCallComplete: (transcript: Message[]) => void;
}

export function AICallSimulator({ onCallComplete }: AICallSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! My name is Alex. Are you calling with a house you'd like to sell?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: PRE_SCREEN_SYSTEM_INSTRUCTION
      },
      history: [
        { role: 'model', parts: [{ text: messages[0].content }] }
      ]
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      if (!chatRef.current) return;
      const response = await chatRef.current.sendMessage({ message: input });
      const modelMsg: Message = { 
        role: 'model', 
        content: response.text || "I understand. Could you tell me more?", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "I'm having a bit of trouble hearing you. Could you repeat that?", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-950 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
      <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-mono text-xs uppercase tracking-widest">Live Call Simulator</span>
        </div>
        <button 
          onClick={() => onCallComplete(messages)}
          className="flex items-center gap-2 px-3 py-1 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600/20 transition-colors text-xs font-bold uppercase"
        >
          <PhoneOff size={14} />
          End Call
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800 border border-gray-700'
                }`}>
                  {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-orange-500" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 p-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-4 bg-gray-900/50 border-t border-gray-800 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Speak to AI Assistant..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono"
        />
        <button 
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
