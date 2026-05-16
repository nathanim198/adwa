/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Users, 
  Calendar, 
  Flag, 
  Map as MapIcon, 
  ChevronRight, 
  ScrollText,
  History,
  Info,
  Waves,
  Sword,
  Search,
  MessageCircle,
  X,
  Send,
  Loader2,
  Volume2,
  Brush,
  Camera,
  Target
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";

const HEROES = [
  {
    name: "Emperor Menelik II",
    title: "King of Kings",
    description: "The visionary leader who unified Ethiopia and masterminded the victory at Adwa through diplomacy and strategic brilliance.",
    image: "https://picsum.photos/seed/menelik/800/1000",
  },
  {
    name: "Empress Taytu Betul",
    title: "Light of Ethiopia",
    description: "The formidable Empress who commanded her own battalion and was instrumental in cut off Italian water supplies.",
    image: "https://picsum.photos/seed/taytu/800/1000",
  },
  {
    name: "Ras Alula Engida",
    title: "The Panther",
    description: "One of the greatest African military strategists, known for his tactical genius and loyalty.",
    image: "https://picsum.photos/seed/alula/800/1000",
  },
];

const TIMELINE = [
  {
    year: "1889",
    title: "Treaty of Wuchale",
    detail: "A deceptive treaty that Italy used to claim protectorate status over Ethiopia, leading to the conflict.",
  },
  {
    year: "1895",
    title: "Battle of Amba Alagi",
    detail: "Initial clashes where Ethiopian forces showed significant strength against occupying troops.",
  },
  {
    year: "1896",
    title: "The Battle of Adwa",
    detail: "March 1: Over 100,000 Ethiopian soldiers decisively defeated the Italian army in a single day.",
  },
  {
    year: "1896",
    title: "Treaty of Addis Ababa",
    detail: "Italy is forced to recognize Ethiopian independence and sovereignty unconditionally.",
  },
];

const TACTICAL_POINTS = [
  { id: 1, x: 25, y: 35, title: "Soloda Mountains", desc: "Key high ground used by Ethiopian scouts to monitor Italian troop movements." },
  { id: 2, x: 60, y: 40, title: "Meqele Garrison", desc: "Where Empress Taytu famously cut off the water supply, paralyzing the siege." },
  { id: 3, x: 45, y: 65, title: "Adwa Basin", desc: "The final showdown area where unified Ethiopian forces converged from all sides." },
];

const GALLERY_IMAGES = [
  { url: "https://picsum.photos/seed/adwa-battle-1/800/1000?grayscale", caption: "The Unified Vanguard", location: "Soloda Slopes" },
  { url: "https://picsum.photos/seed/adwa-crowd/800/1000?grayscale", caption: "The Gathering of Many", location: "Addis Ababa" },
  { url: "https://picsum.photos/seed/ethiopian-shield-art/800/1000?grayscale", caption: "Traditional Armament", location: "Meqele" },
  { url: "https://picsum.photos/seed/tigray-mountains/1200/800?grayscale", caption: "The Rugged Terrain", location: "Adwa Region" },
];

const VISION_PRESETS = [
  "Emperor Menelik II conferring with his generals under a massive fig tree.",
  "Empress Taytu Betul leading the cavalry through a morning mist.",
  "Ethiopian scouts on the heights of Soloda overlooking the Italian camp.",
];

// AI Initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [activeTab, setActiveTab] = useState<"history" | "heroes" | "legacy">("history");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Vision Archive State
  const [visionPrompt, setVisionPrompt] = useState("");
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [isGeneratingVision, setIsGeneratingVision] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const handleGenerateVision = async () => {
    if (!visionPrompt.trim() || isGeneratingVision) return;
    setIsGeneratingVision(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: `Create a cinematic, historical painting of the Battle of Adwa. Style: Oil on canvas, slightly worn with age. Scene: ${visionPrompt}. Include Ethiopian soldiers, traditional flags, and the rugged mountains of Tigray. High drama, epic lighting.`,
      });
      
      const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData) {
        setVisionImage(`data:image/png;base64,${imagePart.inlineData.data}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingVision(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAskAi = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are the 'Adwa Archive Scholar', an expert historian on the Battle of Adwa (1896) and Ethiopian history. Your tone is respectful, scholarly, and evocative of heritage. Provide concise but deeply insightful answers about the figures, strategies, and global legacy of the victory. If asked about unrelated things, politely bring it back to Adwa's historical context."
        }
      });
      
      setMessages(prev => [...prev, { role: 'ai', content: response.text || "I apologize, the archives were difficult to read at this moment." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "An error occurred while consulting the archives. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-heritage-cream selection:bg-terracotta selection:text-white vintage-vignette relative">
      
      {/* Immersive Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-1/4 -left-20 w-96 h-96 bg-terracotta/5 blur-[120px] rounded-full" />
         <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-olive/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-heritage-cream/90 backdrop-blur-sm border-b border-heritage-ink/5">
        <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <motion.div 
               whileHover={{ scale: 1.1, rotate: 5 }}
               className="w-8 h-8 bg-terracotta flex items-center justify-center rounded-sm shadow-md"
            >
              <Shield className="w-4 h-4 text-heritage-cream" />
            </motion.div>
            <span className="font-bold text-sm tracking-[0.2em] uppercase text-heritage-ink group-hover:text-terracotta transition-colors">Adwa 1896</span>
          </div>
          <div className="hidden md:flex gap-10 text-[11px] font-bold uppercase tracking-[0.15em] text-heritage-ink/50">
            {["history", "heroes", "legacy"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`transition-all hover:text-heritage-ink flex items-center gap-1.5 relative ${activeTab === tab ? "text-heritage-ink" : ""}`}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="w-1.5 h-1.5 bg-terracotta rounded-full shadow-[0_0_8px_rgba(166,75,42,0.5)]" 
                  />
                )}
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAiOpen(true)}
              className="p-2.5 rounded-full border border-heritage-ink/10 hover:bg-terracotta hover:text-white transition-all group"
            >
              <Search className="w-4 h-4" />
            </button>
            <button className="text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2.5 bg-heritage-ink text-white rounded-full hover:bg-terracotta transition-all shadow-lg shadow-heritage-ink/10 flex items-center gap-2">
              <ScrollText className="w-3.5 h-3.5" />
              Archives
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Split Hero Section */}
        <section className="relative min-h-screen pt-20 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          {/* Left Content Pane */}
          <div className="px-10 lg:px-20 flex flex-col justify-center space-y-10 border-r border-heritage-ink/5 bg-heritage-cream relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                 <div className="w-6 h-[1px] bg-terracotta" />
                 <p className="text-[13px] font-bold tracking-[0.3em] uppercase text-terracotta">National Commemoration</p>
              </div>
              <h1 className="display text-7xl lg:text-[104px] leading-[0.85] text-heritage-ink font-normal">
                The <br /><span className="italic relative">
                  Adwa
                </span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="serif text-xl lg:text-2xl leading-[1.6] text-heritage-ink/70 max-w-lg italic"
            >
              "I am an Ethiopian. I am African. My victory at Adwa is the heart of our freedom."
            </motion.p>

            <div className="stats-row flex gap-12 pt-10 border-t border-heritage-ink/10 max-w-md">
              {[
                { label: "Year of Victory", val: "1896" },
                { label: "Unified Forces", val: "100k+" },
                { label: "Anniversary", val: "01.03" }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="space-y-1 group cursor-default"
                >
                  <h3 className="display text-3xl text-heritage-ink group-hover:text-terracotta transition-colors">{stat.val}</h3>
                  <p className="text-[10px] items-center uppercase tracking-widest text-heritage-ink/40 font-bold">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Visual Pane */}
          <div className="relative bg-[#EFE9DE] flex items-center justify-center p-10 lg:p-20 overflow-hidden">
            {/* Negarit Pulsing Circle */}
            <div className="absolute top-20 right-20 w-32 h-32 border border-dashed border-heritage-ink/20 rounded-full flex items-center justify-center p-4 text-center negarit-pulse">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-tight text-heritage-ink/40 italic">Negarit: The Beat of Sovereignty</span>
            </div>

            <motion.div 
              style={{ perspective: 1000 }}
              className="relative w-full max-w-[440px] aspect-[1/1.4] z-10"
            >
               <motion.div 
                initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                whileHover={{ rotateY: 10, rotateX: 5 }}
                className="hero-arch w-full h-full bg-gradient-to-br from-olive to-ochre relative shadow-[0_60px_100px_rgba(0,0,0,0.15)] overflow-hidden"
              >
                <div className="pattern-overlay absolute inset-0 opacity-10" />
                <img 
                  src="https://picsum.photos/seed/adwa-pride/800/1200?grayscale" 
                  className="w-full h-full object-cover mix-blend-overlay opacity-60 grayscale"
                  alt="Ethiopian Heritage"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />
                
                {/* Tactical Legend overlay */}
                <div className="absolute top-10 left-10 text-white/40 mix-blend-screen opacity-20 pointer-events-none">
                   <Sword className="w-12 h-12 mb-4" />
                   <div className="text-[10px] font-bold tracking-widest uppercase mb-1">Strategic Superiority</div>
                   <div className="text-[8px] tracking-widest uppercase">General Staff HQ - 1896</div>
                </div>
              </motion.div>
            </motion.div>

            <div className="absolute bottom-20 right-0 transform rotate-[-90deg] translate-x-1/2 flex items-center gap-4 text-xs font-bold tracking-[0.4em] uppercase text-heritage-ink/30 pointer-events-none">
              <div className="w-12 h-[1px] bg-heritage-ink/20" />
              TIGRAY REGION, ETHIOPIA
            </div>
          </div>
        </section>

        {/* Tactical Genius Section - New & Interesting */}
        <section className="bg-heritage-ink text-heritage-cream py-32 overflow-hidden relative">
           <div className="absolute inset-0 opacity-10 pattern-overlay pointer-events-none" />
           <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10 relative z-10">
                 <div className="inline-flex items-center gap-4 px-4 py-2 border border-white/10 rounded-full">
                    <History className="w-4 h-4 text-ochre" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ochre/80">Tactical Genius</span>
                 </div>
                 <h2 className="display text-6xl font-normal leading-tight">Mastery of the <br /><span className="italic text-ochre">Terrain & Intel</span></h2>
                 <p className="serif text-xl opacity-70 leading-relaxed italic max-w-xl">
                   Menelik II didn't just win with numbers. He won with diplomacy, deceptive maneuvers, and the superior logistics overseen by Empress Taytu. 
                 </p>
                 <div className="space-y-6">
                    {[
                      { icon: <Waves className="w-5 h-5" />, title: "Water Supply Seizure", desc: "Empress Taytu personally led forces to cut off the Italian water supply at Meqele." },
                      { icon: <Shield className="w-5 h-5" />, title: "False Intelligence", desc: "Italian generals were fed contradictory local reports, leading them to split their forces." },
                      { icon: <Sword className="w-5 h-5" />, title: "High-Caliber Arsenal", desc: "Ethiopia possessed modern firearms secured through shrewd European diplomacy." }
                    ].map((feat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex gap-6 items-start"
                      >
                         <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                            {feat.icon}
                         </div>
                         <div>
                            <h4 className="font-bold text-sm tracking-widest uppercase mb-1">{feat.title}</h4>
                            <p className="serif text-sm opacity-50 italic">{feat.desc}</p>
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
              <div className="relative group lg:pl-10">
                 <div className="absolute -inset-10 bg-ochre/5 blur-[100px] rounded-full group-hover:bg-ochre/10 transition-colors" />
                 <motion.div 
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    className="relative bg-white/5 border border-white/10 p-4 rounded-[60px] overflow-hidden backdrop-blur-md aspect-square"
                  >
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                       <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/topography.png')] bg-repeat" />
                    </div>
                    
                    <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-heritage-ink/40 border border-white/5 shadow-inner">
                       <img 
                         src="https://picsum.photos/seed/adwa-topo/1200/1200?grayscale" 
                         className="w-full h-full object-cover opacity-30 mix-blend-luminosity filter sepia-[0.5]" 
                         alt="Topographical Map"
                         referrerPolicy="no-referrer"
                       />
                       
                       {TACTICAL_POINTS.map((point) => (
                         <div 
                           key={point.id}
                           className="absolute"
                           style={{ left: `${point.x}%`, top: `${point.y}%` }}
                           onMouseEnter={() => setHoveredPoint(point.id)}
                           onMouseLeave={() => setHoveredPoint(null)}
                         >
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="map-point"
                            >
                               <Target className="w-full h-full p-0.5 text-white" />
                            </motion.div>
                            
                            <AnimatePresence>
                              {hoveredPoint === point.id && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                  animate={{ opacity: 1, y: -40, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                  className="map-tooltip -translate-x-1/2"
                                >
                                   <div className="font-bold uppercase tracking-widest text-[10px] text-terracotta mb-1">{point.title}</div>
                                   <div>{point.desc}</div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                         </div>
                       ))}
                    </div>

                    <div className="absolute bottom-8 right-8 text-white/40 flex items-center gap-2">
                       <MapIcon className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Tactical Overlay 1896.v2</span>
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* Content Section (Tabs) */}
        <section className="max-w-7xl mx-auto px-10 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
            
            <aside className="lg:col-span-4 space-y-12">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-1 bg-terracotta rounded-full" />
                    <h3 className="display text-2xl font-bold uppercase tracking-tight text-heritage-ink">
                      The Narrative
                    </h3>
                  </div>
                  <p className="serif text-xl leading-relaxed text-heritage-ink/70 italic">
                    "The roar of the Negarit was so vast that it shook the very mountains of Tigray. Leaders from every province brought their bravest sons and daughters."
                  </p>
               </div>

               {/* Interesting Fact Card */}
               <motion.div 
                whileHover={{ y: -10 }}
                className="p-10 bg-olive text-heritage-cream rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden"
               >
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                  <Info className="w-8 h-8 text-ochre" />
                  <h4 className="display text-2xl lowercase italic font-medium">did you know?</h4>
                  <p className="serif text-lg opacity-80 leading-relaxed">
                    The Italians underestimated the Ethiopians, believing them to be poorly armed. In reality, Ethiopia had over 100,000 modern rifles, many purchased from European merchants.
                  </p>
               </motion.div>
            </aside>

            <div className="lg:col-span-8">
               <AnimatePresence mode="wait">
                 {activeTab === "history" && (
                   <motion.div 
                     key="history"
                     initial={{ opacity: 0, x: 20 }} 
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-20"
                   >
                     <h2 className="display text-6xl font-normal leading-none text-heritage-ink">The Path to <br /><span className="italic text-terracotta">Freedom</span></h2>
                     <div className="space-y-16 relative">
                       {TIMELINE.map((item, i) => (
                         <div key={i} className="flex gap-8 group">
                           <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-heritage-ink/10 group-hover:bg-terracotta transition-colors shadow-sm" />
                              <div className="w-[1px] flex-grow bg-heritage-ink/10 mt-2" />
                           </div>
                           <div className="space-y-4 pb-8">
                              <span className="display text-3xl text-terracotta font-medium italic">{item.year}</span>
                              <h4 className="display text-2xl font-bold text-heritage-ink">{item.title}</h4>
                              <p className="serif text-lg text-heritage-ink/60 leading-relaxed max-w-md">
                                {item.detail}
                              </p>
                           </div>
                         </div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {activeTab === "heroes" && (
                   <motion.div 
                      key="heroes"
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-16"
                   >
                      <h2 className="display text-6xl font-normal leading-none text-heritage-ink">Figures of <br /><span className="italic text-olive">Destiny</span></h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {HEROES.map((hero, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative space-y-8"
                          >
                            <div className="hero-arch aspect-[1/1.4] overflow-hidden shadow-xl ring-8 ring-heritage-ink/[0.02]">
                              <img 
                                src={hero.image} 
                                alt={hero.name} 
                                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-3 px-2">
                              <div>
                                <span className="text-[10px] uppercase tracking-widest text-terracotta font-bold">{hero.title}</span>
                                <h4 className="display text-3xl font-bold mt-1 text-heritage-ink">{hero.name}</h4>
                              </div>
                              <p className="serif text-base text-heritage-ink/60 leading-relaxed italic">
                                {hero.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                   </motion.div>
                 )}

                 {activeTab === "legacy" && (
                   <motion.div 
                     key="legacy"
                     initial={{ opacity: 0, scale: 0.98 }} 
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 1.02 }}
                     className="space-y-16"
                   >
                     <h2 className="display text-6xl font-normal leading-none text-heritage-ink">A Global <br /><span className="italic text-ochre">Symbol</span></h2>
                     
                     {/* Legacy Bento Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white border border-heritage-ink/5 rounded-[40px] space-y-6 shadow-sm hover:shadow-xl transition-all">
                           <div className="w-12 h-12 bg-terracotta/5 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-terracotta" />
                           </div>
                           <h4 className="display text-2xl font-bold italic text-heritage-ink">Pan-Africanism</h4>
                           <p className="serif text-base text-heritage-ink/70 leading-relaxed">
                              Adwa became the rallying cry for Pan-African movements. The victory gave hope to Africans under colonial rule from the Caribbean to the Cape.
                           </p>
                        </div>
                        <div className="p-8 bg-white border border-heritage-ink/5 rounded-[40px] space-y-6 shadow-sm hover:shadow-xl transition-all">
                           <div className="w-12 h-12 bg-olive/5 rounded-full flex items-center justify-center">
                              <Flag className="w-5 h-5 text-olive" />
                           </div>
                           <h4 className="display text-2xl font-bold italic text-heritage-ink">The Colors of Freedom</h4>
                           <p className="serif text-base text-heritage-ink/70 leading-relaxed">
                              The green, yellow, and red were adopted by dozens of African nations as they gained independence.
                           </p>
                        </div>
                        <div className="md:col-span-2 p-10 bg-ochre/10 border border-ochre/20 rounded-[40px] flex flex-col md:flex-row items-center gap-10">
                           <Volume2 className="w-12 h-12 text-ochre shrink-0" />
                           <div className="space-y-2 text-center md:text-left">
                              <h4 className="display text-2xl font-bold text-heritage-ink">The Negarit Echo</h4>
                              <p className="serif text-base text-heritage-ink/70 italic">
                                Even 130 years later, the victory is celebrated annually across the world, a constant reminder of African dignity and self-determination.
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="mt-20 p-16 bg-ochre/5 border border-ochre/10 hero-arch text-center space-y-10 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute inset-0 pattern-overlay opacity-5 pointer-events-none" />
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }}>
                          <ScrollText className="w-10 h-10 text-ochre mx-auto" strokeWidth={1} />
                        </motion.div>
                        <h3 className="display text-4xl lg:text-5xl font-medium italic text-heritage-ink leading-tight max-w-2xl mx-auto">
                          "Adwa is not just an Ethiopian victory, it is a human victory for dignity."
                        </h3>
                        <button className="bg-heritage-ink text-white px-12 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-terracotta transition-all shadow-xl shadow-heritage-ink/20">
                          Explore the Digital Archive
                        </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Vision Archive - AI Image Generation */}
        <section className="bg-[#EAE4D8] py-32 relative overflow-hidden">
           <div className="absolute inset-0 opacity-5 pattern-overlay pointer-events-none" />
           <div className="max-w-4xl mx-auto px-10 text-center space-y-16">
              <div className="space-y-6">
                 <div className="flex justify-center items-center gap-4">
                    <Brush className="w-6 h-6 text-terracotta" />
                    <span className="text-[12px] font-bold uppercase tracking-[0.4em] text-heritage-ink">The Vision Archive</span>
                 </div>
                 <h2 className="display text-5xl lg:text-7xl font-normal leading-tight text-heritage-ink">
                    Reconstruct <br /><span className="italic text-terracotta">Lost Moments</span>
                 </h2>
                 <p className="serif text-xl text-heritage-ink/60 italic max-w-2xl mx-auto leading-relaxed">
                    Use our neural archives to visualize historical accounts that were never captured on film. Describe a scene from the battle, and the archive will render it in period-style artistry.
                 </p>
              </div>

              <div className="relative group max-w-2xl mx-auto">
                 <div className="relative flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      placeholder="e.g. Empress Taytu commanding the battalion during the rain..."
                      className="flex-grow bg-white border border-heritage-ink/10 rounded-2xl md:rounded-full px-8 py-5 serif text-lg focus:outline-none focus:ring-2 focus:ring-terracotta transition-all shadow-sm"
                      value={visionPrompt}
                      onChange={(e) => setVisionPrompt(e.target.value)}
                    />
                    <button 
                      onClick={handleGenerateVision}
                      disabled={isGeneratingVision}
                      className="bg-heritage-ink text-white px-10 py-5 rounded-2xl md:rounded-full font-bold uppercase tracking-widest text-xs hover:bg-terracotta transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                    >
                       {isGeneratingVision ? (
                         <Loader2 className="w-4 h-4 animate-spin" />
                       ) : (
                         <Camera className="w-4 h-4" />
                       )}
                       Generate
                    </button>
                 </div>
                 
                 <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {VISION_PRESETS.map((preset, i) => (
                       <button 
                          key={i}
                          onClick={() => setVisionPrompt(preset)}
                          className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-heritage-ink/10 hover:border-terracotta hover:text-terracotta transition-colors"
                       >
                          Preset {i + 1}
                       </button>
                    ))}
                 </div>
              </div>

              <AnimatePresence>
                 {visionImage && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9, y: 30 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className="max-w-2xl mx-auto relative cursor-zoom-in"
                   >
                      <div className="absolute -inset-4 bg-white/40 blur-xl rounded-[60px]" />
                      <div className="relative hero-arch overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.2)] border-8 border-white">
                         <img 
                           src={visionImage} 
                           alt="AI Generated Vision" 
                           className="w-full h-auto filter sepia-[0.1]" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                         <div className="absolute bottom-8 left-0 right-0 text-white px-8 text-left">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 italic">Archive Vision ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                         </div>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </section>

      </main>

      <footer className="border-t border-heritage-ink/5 py-24 px-10 bg-[#EFE9DE]/50 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-16 text-heritage-ink/40">
           <div className="display font-bold text-3xl uppercase tracking-tighter text-heritage-ink/10">
              The Adwa Archive
           </div>
           
           <div className="flex justify-center gap-16 text-[11px] uppercase font-bold tracking-[0.2em]">
              <a href="#" className="hover:text-terracotta transition-colors">Education</a>
              <a href="#" className="hover:text-terracotta transition-colors">Heritage</a>
              <a href="#" className="hover:text-terracotta transition-colors">Contact</a>
           </div>

           <div className="text-[11px] uppercase tracking-widest leading-loose md:text-right font-medium">
              Celebrating 130 years of Sovereignty.<br />
              Digital Experience © 2026.
           </div>
        </div>
      </footer>

      {/* AI Scholar Sidebar */}
      <AnimatePresence>
        {isAiOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiOpen(false)}
              className="fixed inset-0 bg-heritage-ink/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-heritage-cream z-[70] shadow-2xl flex flex-col border-l border-heritage-ink/10"
            >
               <div className="p-8 border-b border-heritage-ink/5 flex items-center justify-between">
                  <div>
                    <h3 className="display text-2xl font-bold text-heritage-ink">Archive Scholar</h3>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-terracotta">AI Historical Guide</p>
                  </div>
                  <button 
                    onClick={() => setIsAiOpen(false)}
                    className="p-2 hover:bg-heritage-ink/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-heritage-ink" />
                  </button>
               </div>

               <div className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  {messages.length === 0 && (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-ochre/10 rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle className="w-8 h-8 text-ochre" />
                      </div>
                      <p className="serif text-lg text-heritage-ink/60 italic leading-relaxed">
                        "Ask me about the tactical strategies, the role of local leaders, or the treaty of Wuchale."
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                       <div className={`max-w-[85%] p-5 rounded-3xl serif text-base leading-relaxed ${
                         msg.role === 'user' 
                          ? 'bg-heritage-ink text-white' 
                          : 'bg-white border border-heritage-ink/5 text-heritage-ink shadow-sm italic'
                       }`}>
                          {msg.content}
                       </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                       <div className="bg-white border border-heritage-ink/5 p-4 rounded-3xl flex items-center gap-3">
                          <Loader2 className="w-4 h-4 text-terracotta animate-spin" />
                          <span className="text-xs font-bold uppercase tracking-widest text-heritage-ink/40">Consulting Archives...</span>
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-8 border-t border-heritage-ink/5 bg-white/50 backdrop-blur-md">
                  <div className="relative">
                    <input 
                      type="text"
                      className="w-full bg-white border border-heritage-ink/10 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-1 focus:ring-terracotta serif text-lg transition-all"
                      placeholder="Ask the Scholar..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                    />
                    <button 
                      onClick={handleAskAi}
                      className="absolute right-2 top-2 w-10 h-10 bg-heritage-ink text-white rounded-full flex items-center justify-center hover:bg-terracotta transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
