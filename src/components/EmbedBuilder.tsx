import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Type, 
  Palette, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Send, 
  Sparkles, 
  Code, 
  Eye,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Hash,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { generateResponse } from '../services/geminiService';
import { supabase, safeFetch } from '../lib/supabase';

interface EmbedData {
  title: string;
  description: string;
  url: string;
  color: string;
  timestamp: boolean;
  footer: {
    text: string;
    icon_url: string;
  };
  image: {
    url: string;
  };
  thumbnail: {
    url: string;
  };
  author: {
    name: string;
    url: string;
    icon_url: string;
  };
  fields: { name: string; value: string; inline: boolean }[];
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
}

const initialEmbed: EmbedData = {
  title: 'New Embed Title',
  description: 'This is a description for your Discord embed.',
  url: '',
  color: '#ffffff',
  timestamp: false,
  footer: { text: '', icon_url: '' },
  image: { url: '' },
  thumbnail: { url: '' },
  author: { name: '', url: '', icon_url: '' },
  fields: []
};

export const EmbedBuilder: React.FC = () => {
  const [embed, setEmbed] = useState<EmbedData>(initialEmbed);
  const [guildId, setGuildId] = useState('');
  const [channelId, setChannelId] = useState('');
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'json'>('editor');

  useEffect(() => {
    const fetchChannels = async () => {
      setLoadingChannels(true);
      const data = await safeFetch(supabase.from('channels').select('*'), [], 'Fetch channels');
      setChannels(data);
      setLoadingChannels(false);
    };
    fetchChannels();
  }, []);

  const handleSend = async () => {
    if (!channelId) {
      setStatus({ success: false, message: "Channel ID is required." });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch('/api/discord/send-embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: guildId || undefined,
          channelId,
          content,
          embed: {
            ...embed,
            color: parseInt(embed.color.replace('#', ''), 16),
            timestamp: embed.timestamp ? new Date().toISOString() : undefined,
            footer: embed.footer.text ? embed.footer : undefined,
            image: embed.image.url ? embed.image : undefined,
            thumbnail: embed.thumbnail.url ? embed.thumbnail : undefined,
            author: embed.author.name ? embed.author : undefined,
            fields: embed.fields.length > 0 ? embed.fields : undefined
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setStatus({ success: true, message: "Embed sent successfully!" });
      } else {
        setStatus({ success: false, message: data.error || "Failed to send embed." });
      }
    } catch (error) {
      setStatus({ success: false, message: "An error occurred while sending the embed." });
    } finally {
      setIsSending(false);
    }
  };

  const handleAiHelper = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    
    const systemInstruction = `You are an expert Discord Embed Builder. You have ALL knowledge on how Discord embeds work, including limits (title: 256 chars, description: 4096 chars, 25 fields, etc.). 
    When the user asks you to build or refine an embed, you MUST respond ONLY with a valid JSON object representing the embed data.
    The JSON structure should be:
    {
      "title": "string",
      "description": "string",
      "url": "string",
      "color": "#hexcode",
      "timestamp": boolean,
      "footer": { "text": "string", "icon_url": "string" },
      "image": { "url": "string" },
      "thumbnail": { "url": "string" },
      "author": { "name": "string", "url": "string", "icon_url": "string" },
      "fields": [{ "name": "string", "value": "string", "inline": boolean }]
    }
    Do not include any markdown formatting like \`\`\`json or extra text. Just the raw JSON object.`;

    try {
      const response = await generateResponse(`Generate an embed based on this request: ${aiPrompt}`, systemInstruction);
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const newEmbed = JSON.parse(cleanedResponse);
      setEmbed({ ...initialEmbed, ...newEmbed });
      setAiPrompt('');
    } catch (error) {
      console.error("AI Embed Helper Error:", error);
      alert("Failed to generate embed from AI. Please make sure the AI returned valid JSON.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const addField = () => {
    if (embed.fields.length < 25) {
      setEmbed({ ...embed, fields: [...embed.fields, { name: 'Field Name', value: 'Field Value', inline: false }] });
    }
  };

  const removeField = (index: number) => {
    const newFields = [...embed.fields];
    newFields.splice(index, 1);
    setEmbed({ ...embed, fields: newFields });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Embed Builder</h1>
          <p className="text-text-secondary">Craft and send professional Discord embeds with AI assistance.</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-bg-secondary rounded-xl border border-border overflow-x-auto custom-scrollbar whitespace-nowrap">
          <button 
            onClick={() => setActiveTab('editor')}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all shrink-0", activeTab === 'editor' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Editor
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all shrink-0", activeTab === 'preview' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            Preview
          </button>
          <button 
            onClick={() => setActiveTab('json')}
            className={cn("px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all shrink-0", activeTab === 'json' ? "bg-white text-black shadow-sm" : "text-text-secondary hover:text-text-primary")}
          >
            JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration & AI */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Helper Card */}
          <div className="glass p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Gemini Embed Helper</h3>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Describe the embed you want (e.g. 'A welcome embed with a blue theme')..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-text-primary"
              />
              <button 
                onClick={handleAiHelper}
                disabled={!aiPrompt || isAiGenerating}
                className="px-6 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isAiGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate
              </button>
            </div>
          </div>

          {/* Editor Tabs */}
          {activeTab === 'editor' && (
            <div className="glass p-8 rounded-2xl border border-border space-y-8">
              {/* Destination Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Hash size={16} className="text-white/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Destination</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Channel</label>
                    <div className="relative">
                      <select 
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary appearance-none"
                      >
                        <option value="">Select a channel...</option>
                        {channels.map(c => (
                          <option key={c.id} value={c.id}>#{c.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                        {loadingChannels ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Manual Channel ID (Override)</label>
                    <input 
                      type="text" 
                      placeholder="Enter Channel ID"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Message Content (Optional)</label>
                  <textarea 
                    placeholder="Text above the embed..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all h-20 resize-none text-text-primary"
                  />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Type size={16} className="text-white/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Basic Content</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Title</label>
                    <input 
                      type="text" 
                      value={embed.title}
                      onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
                      className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={embed.color}
                        onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                        className="h-10 w-12 bg-bg-tertiary border border-border rounded-xl cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={embed.color}
                        onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                        className="flex-1 bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Description</label>
                  <textarea 
                    value={embed.description}
                    onChange={(e) => setEmbed({ ...embed, description: e.target.value })}
                    className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all h-32 resize-none text-text-primary"
                  />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Media Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-text-secondary">
                  <ImageIcon size={16} className="text-white/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Media & Links</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Image URL</label>
                    <input 
                      type="text" 
                      value={embed.image.url}
                      onChange={(e) => setEmbed({ ...embed, image: { url: e.target.value } })}
                      className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Thumbnail URL</label>
                    <input 
                      type="text" 
                      value={embed.thumbnail.url}
                      onChange={(e) => setEmbed({ ...embed, thumbnail: { url: e.target.value } })}
                      className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/50 transition-all text-text-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Fields Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-text-secondary">
                    <Layout size={16} className="text-white/40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Fields ({embed.fields.length}/25)</span>
                  </div>
                  <button 
                    onClick={addField}
                    className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-all"
                  >
                    + Add Field
                  </button>
                </div>
                <div className="space-y-4">
                  {embed.fields.map((field, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-border space-y-4 relative group">
                      <button 
                        onClick={() => removeField(idx)}
                        className="absolute top-2 right-2 p-1 text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Name</label>
                          <input 
                            type="text" 
                            value={field.name}
                            onChange={(e) => {
                              const newFields = [...embed.fields];
                              newFields[idx].name = e.target.value;
                              setEmbed({ ...embed, fields: newFields });
                            }}
                            className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-white/50 text-text-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Value</label>
                          <input 
                            type="text" 
                            value={field.value}
                            onChange={(e) => {
                              const newFields = [...embed.fields];
                              newFields[idx].value = e.target.value;
                              setEmbed({ ...embed, fields: newFields });
                            }}
                            className="w-full bg-bg-tertiary border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-white/50 text-text-primary"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={field.inline}
                          onChange={(e) => {
                            const newFields = [...embed.fields];
                            newFields[idx].inline = e.target.checked;
                            setEmbed({ ...embed, fields: newFields });
                          }}
                          className="accent-white"
                        />
                        <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Inline</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="glass p-12 rounded-2xl border border-border flex items-center justify-center bg-black/20">
              <div className="w-full max-w-md space-y-2">
                {content && <p className="text-sm text-[#dbdee1] whitespace-pre-wrap">{content}</p>}
                <div className="flex gap-3">
                  <div className="w-1 rounded-l-md" style={{ backgroundColor: embed.color }} />
                  <div className="flex-1 bg-[#2b2d31] p-4 rounded-r-md space-y-3 shadow-lg">
                    {embed.author.name && (
                      <div className="flex items-center gap-2">
                        {embed.author.icon_url && <img src={embed.author.icon_url} className="w-6 h-6 rounded-full" alt="" />}
                        <span className="text-sm font-bold text-white">{embed.author.name}</span>
                      </div>
                    )}
                    {embed.title && <h3 className="text-base font-bold text-[#00a8fc] hover:underline cursor-pointer">{embed.title}</h3>}
                    {embed.description && <p className="text-sm text-[#dbdee1] whitespace-pre-wrap">{embed.description}</p>}
                    
                    {embed.fields.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {embed.fields.map((f, i) => (
                          <div key={i} className={cn(f.inline ? "col-span-1" : "col-span-3")}>
                            <p className="text-sm font-bold text-white">{f.name}</p>
                            <p className="text-sm text-[#dbdee1]">{f.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {embed.image.url && <img src={embed.image.url} className="mt-4 rounded-md w-full max-h-80 object-cover" alt="" />}
                    
                    <div className="flex items-center gap-2 mt-4">
                      {embed.footer.icon_url && <img src={embed.footer.icon_url} className="w-5 h-5 rounded-full" alt="" />}
                      <span className="text-[10px] text-[#dbdee1]">{embed.footer.text} {embed.timestamp && "• Today at 12:00 PM"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="glass p-8 rounded-2xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Code size={16} className="text-white/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Raw JSON Output</span>
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(embed, null, 2))}
                  className="text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-all"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="bg-black/40 p-6 rounded-xl border border-border text-xs font-mono text-blue-300 overflow-x-auto max-h-[500px] custom-scrollbar">
                {JSON.stringify(embed, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: Status & Send */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-2xl border border-border space-y-6 sticky top-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 text-white">
                <Send size={20} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-widest">Publish</h3>
            </div>

            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-xl border flex items-center gap-3",
                  status.success ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}
              >
                {status.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p className="text-xs font-bold">{status.message}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-border space-y-2">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Info size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Validation</span>
                </div>
                <ul className="space-y-1">
                  <li className={cn("text-[10px] flex items-center gap-2", channelId ? "text-green-400" : "text-text-secondary")}>
                    <div className={cn("w-1 h-1 rounded-full", channelId ? "bg-green-400" : "bg-text-secondary")} />
                    Channel ID set
                  </li>
                  <li className={cn("text-[10px] flex items-center gap-2", embed.title || embed.description ? "text-green-400" : "text-text-secondary")}>
                    <div className={cn("w-1 h-1 rounded-full", embed.title || embed.description ? "bg-green-400" : "bg-text-secondary")} />
                    Content defined
                  </li>
                </ul>
              </div>

              <button 
                onClick={handleSend}
                disabled={!channelId || isSending}
                className="w-full py-4 rounded-xl bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSending ? 'Sending...' : 'Send to Discord'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
