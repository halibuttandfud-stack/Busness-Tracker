/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Trophy, 
  AlertCircle, 
  ChevronRight, 
  Star, 
  Store,
  ExternalLink,
  Loader2,
  BarChart3,
  Lightbulb,
  LocateFixed,
  Download,
  Mail,
  X,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from 'react-markdown';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AnalysisResult {
  competitors: {
    name: string;
    rating: number;
    reviews: number;
    strengths: string[];
    weaknesses: string[];
    ranking_factors: string;
  }[];
  summary: string;
  recommendations: string[];
  gap_score?: string;
}

export default function App() {
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isCapturingEmail, setIsCapturingEmail] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);

  const downloadReport = () => {
    if (!result) return;

    const content = `
LOCAL RANK INSIGHT AUDIT
Generated on: ${new Date().toLocaleDateString()}
================================================

BUSINESS: ${businessName}
LOCATION: ${address}
GAP SCORE: ${result.gap_score || 'N/A'}

MARKET SUMMARY
--------------
${result.summary}

COMPETITIVE LANDSCAPE
---------------------
${result.competitors.map((c, i) => `
${i + 1}. ${c.name}
   Rating: ${c.rating} | Reviews: ${c.reviews}
   Strengths: ${c.strengths.join(', ')}
   Analysis: ${c.ranking_factors}
`).join('\n')}

DIAGNOSTIC LOG (RECOMMENDATIONS)
--------------------------------
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n\n')}

Copyright © ${new Date().getFullYear()} RankLogic Insight Engine.
Confidential SEO Assessment.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RankLogic_Audit_${businessName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsCapturingEmail(true);
    // Simulate API call to capture lead
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsCapturingEmail(false);
    setCaptureSuccess(true);
    setTimeout(() => {
      setShowEmailModal(false);
      setCaptureSuccess(false);
    }, 3000);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location. Please type it manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const analyzeCompetitors = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !address) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const prompt = `
        You are a Local SEO Expert. I want you to analyze the competitive landscape for a business.
        Business Name: ${businessName}
        Location: ${address}

        Step 1: Use googleSearch to find the top 3-5 competitors for this business type in that specific area.
        Step 2: Compare their Google Business Profile features (review count, average rating, primary categories, presence of a website, frequency of posts if visible).
        Step 3: Provide a detailed analysis of why these competitors might be outranking the user's business (${businessName}).
        Step 4: Give 5 actionable recommendations for ${businessName} to improve their local ranking.

        IMPORTANT: Return the response in a structured format that I can present in an editorial dashboard.
        Format your response as a JSON object with the following structure:
        {
          "competitors": [
            {
              "name": "string",
              "rating": number,
              "reviews": number,
              "strengths": ["string"],
              "weaknesses": ["string"],
              "ranking_factors": "Explain the key reasons they are winning"
            }
          ],
          "summary": "Overall market summary in markdown (keep it punchy)",
          "recommendations": ["string"],
          "gap_score": "A number from 1-10 representing how far behind the user is"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        }
      });

      const parsedResult = JSON.parse(response.text || '{}');
      setResult(parsedResult);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze local ranking. Please check the address and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#1a1a1a] font-sans flex flex-col selection:bg-black selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-[#1a1a1a]/10 px-12 py-6 flex justify-between items-center bg-[#fdfcfb]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-black italic">RankLogic</span>
          <span className="text-[10px] uppercase tracking-widest bg-black text-white px-2 py-0.5">Insight Engine</span>
        </div>
        
        <form onSubmit={analyzeCompetitors} className="flex-1 max-w-2xl mx-12 hidden lg:flex gap-4">
          <div className="flex-1 border border-[#1a1a1a] px-4 py-2 flex items-center group">
            <span className="text-[10px] uppercase tracking-widest text-[#1a1a1a]/50 mr-3 shrink-0">Location:</span>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Seattle, WA"
              className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-[#1a1a1a]/20 text-editorial-ink" 
              required
            />
            <button 
              type="button"
              onClick={getCurrentLocation}
              disabled={isLocating}
              className="ml-2 text-[#1a1a1a]/40 hover:text-black transition-colors cursor-pointer disabled:opacity-30"
              title="Use current location"
            >
              {isLocating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
            </button>
          </div>
          <button 
            type="submit" 
            disabled={isAnalyzing}
            className="bg-black text-white px-8 text-[10px] uppercase tracking-widest font-black flex items-center gap-2 hover:bg-[#1a1a1a]/80 transition-all disabled:opacity-50 h-10 shrink-0 cursor-pointer"
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : "New Audit +"}
          </button>
        </form>

        <div className="flex space-x-8 text-[11px] uppercase tracking-[0.2em] font-bold text-[#1a1a1a]/60">
          <span className="hover:text-black cursor-pointer hidden md:block">Settings</span>
          <span className="hover:text-black cursor-pointer hidden md:block">History</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Search Overlay if no result and not analyzing */}
        {!result && !isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-start lg:justify-center p-8 lg:p-12 bg-[#fdfcfb] z-40 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl w-full text-center py-12"
            >
              <h2 className="text-[10px] uppercase tracking-[0.4em] font-semibold text-gray-400 mb-8 italic">Performance Indexing</h2>
              <h1 className="font-serif text-[clamp(3rem,10vw,8rem)] leading-[0.8] tracking-tighter italic mb-12">
                Audit Your <br />Local Alpha.
              </h1>
              
              <form onSubmit={analyzeCompetitors} className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold ml-4 italic">Business Identity</span>
                  <div className="border border-black p-6 bg-white shadow-xl transition-shadow focus-within:shadow-2xl">
                    <input 
                      type="text" 
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. Blue Bottle Coffee" 
                      className="w-full bg-transparent text-2xl font-serif italic outline-none placeholder:text-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 lg:hidden">
                  <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold ml-4 italic">Spatial Coordinates</span>
                  <div className="border border-black p-6 bg-white shadow-xl transition-shadow focus-within:shadow-2xl flex items-center">
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="City or Full Address" 
                      className="w-full bg-transparent text-xl font-serif italic outline-none placeholder:text-gray-200"
                      required
                    />
                    <button 
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                      className="ml-4 text-black/40 hover:text-black transition-colors cursor-pointer disabled:opacity-30"
                    >
                      {isLocating ? <Loader2 size={20} className="animate-spin" /> : <LocateFixed size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 text-[10px] uppercase tracking-widest font-bold italic">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full bg-black text-white py-6 text-xs uppercase tracking-[0.3em] font-black italic hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? "Processing..." : "Initiate diagnostic scan"}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div 
               key="analyzing"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex-1 flex flex-col items-center justify-start lg:justify-center p-8 lg:p-12 bg-[#1a1a1a] text-white absolute inset-0 z-50 text-center overflow-y-auto py-24"
            >
               <div className="space-y-12 max-w-sm w-full">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-500 block animate-pulse italic underline underline-offset-8">Scanning Network Nodes</span>
                  <div className="w-full h-px bg-white/10 overflow-hidden relative">
                    <motion.div 
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-1/2 h-full bg-white shadow-[0_0_15px_white]"
                    />
                  </div>
                  <h2 className="text-5xl font-serif italic font-light tracking-tighter">Triangulating <br />Competitors...</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-white/5 p-4 flex flex-col gap-2">
                       <span className="text-[8px] uppercase tracking-widest text-gray-600">NAP Consistency</span>
                       <div className="h-0.5 bg-white/10 w-full rounded-full overflow-hidden">
                          <motion.div initial={{width: 0}} animate={{width: '70%'}} className="h-full bg-white" />
                       </div>
                    </div>
                    <div className="border border-white/5 p-4 flex flex-col gap-2">
                       <span className="text-[8px] uppercase tracking-widest text-gray-600">Review Velocity</span>
                       <div className="h-0.5 bg-white/10 w-full rounded-full overflow-hidden">
                          <motion.div initial={{width: 0}} animate={{width: '40%'}} className="h-full bg-white" />
                       </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          ) : result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Left Column: The Big Number */}
              <div className="col-span-12 lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#1a1a1a]/5">
                <div className="space-y-6">
                  <h2 className="text-[10px] uppercase tracking-[0.4em] font-semibold text-gray-400 italic">Market Index</h2>
                  <h1 className="font-serif text-[clamp(4rem,12vw,120px)] leading-[0.8] tracking-tighter italic">
                    Gap: {result.gap_score || '04'}
                  </h1>
                  <div className="max-w-md prose prose-editorial prose-p:font-serif prose-p:italic prose-p:text-gray-600 prose-p:text-lg prose-p:leading-snug prose-headings:font-serif lg:mb-12">
                    <ReactMarkdown>{result.summary}</ReactMarkdown>
                  </div>
                </div>

                <div className="border-l-4 border-black pl-6 py-2 mt-12 lg:mt-0">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Priority Vector</p>
                  <p className="text-xl font-medium leading-tight italic font-serif">
                    {result.recommendations?.[0]?.split(':')?.[0] || 'Metadata Signal Decay detected'}
                  </p>
                </div>
              </div>

              {/* Center: The Comparison Visual */}
              <div className="col-span-12 lg:col-span-4 py-12 relative flex items-center justify-center bg-gray-50/30 overflow-hidden min-h-[500px]">
                <div className="absolute inset-0 border-x border-[#1a1a1a]/5 pointer-events-none hidden lg:block"></div>
                <div className="h-full flex flex-col justify-center space-y-12 px-8 py-12 relative z-10 w-full max-w-sm">
                  
                  {/* Card: Your Business */}
                  <motion.div 
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 16, opacity: 1 }}
                    className="border border-gray-200 p-6 bg-white shadow-sm relative z-10 transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-serif text-2xl">{businessName}</h3>
                      <span className="text-xl font-bold font-serif italic text-gray-300">#{result.competitors ? result.competitors.length + 1 : 1}</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-gray-300">
                        <span>Pack Position</span>
                        <span className="text-black">Deficit</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1">
                        <div className="bg-gray-400 h-full w-[42%]"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card: Primary Competitor */}
                  {result.competitors && result.competitors.length > 0 && (
                    <motion.div 
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: -16, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="border border-black p-6 bg-white shadow-2xl relative z-20 group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif text-2xl italic">{result.competitors[0].name}</h3>
                          <span className="text-[8px] uppercase tracking-[0.2em] font-black text-gray-400 mt-1 block">Local Search Lead</span>
                        </div>
                        <span className="text-2xl font-black italic">#1</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-gray-400">
                          <span>Profile Score</span>
                          <span className="text-black font-bold font-mono">98%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: '98%' }}
                            className="bg-black h-full"
                          />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Sentiment</span>
                          <span className="font-serif italic font-bold">{result.competitors[0].rating} ★</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right Column: Diagnostic Log */}
              <div className="col-span-12 lg:col-span-3 p-8 lg:p-12 bg-[#1a1a1a] text-white flex flex-col">
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-12 italic underline underline-offset-8 decoration-[#333]">Diagnostic Log</h3>
                
                <div className="flex-1 space-y-12 mb-12">
                  {result.recommendations && result.recommendations.map((rec: string, i: number) => {
                    const parts = rec.includes(':') ? rec.split(':') : [null, rec];
                    const title = parts[0] ? parts[0].trim() : `Module ${i + 1}`;
                    const description = parts[1] ? parts[1].trim() : parts[0];
                    
                    return (
                      <motion.section 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (i * 0.1) }}
                        className="group"
                      >
                        <span className="text-2xl font-serif block mb-2 italic transition-colors group-hover:text-[#FF6321]">
                          {i + 1 < 10 ? `0${i + 1}` : i + 1}. {title}
                        </span>
                        <p className="text-sm text-gray-400 leading-relaxed font-light italic font-serif">
                          {description}
                        </p>
                      </motion.section>
                    );
                  })}
                </div>
                
                <div className="mt-auto pt-12 border-t border-white/10 space-y-4">
                  <button 
                    onClick={downloadReport}
                    className="w-full py-4 border border-white/20 hover:bg-white hover:text-black transition-all uppercase text-[10px] tracking-[0.3em] font-black italic cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    Download Narrative
                  </button>
                  <button 
                    onClick={() => setShowEmailModal(true)}
                    className="w-full py-4 bg-[#FF6321] text-white hover:bg-[#FF6321]/90 transition-all uppercase text-[10px] tracking-[0.3em] font-black italic cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Mail size={14} />
                    Send to Email
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Email Capture Modal */}
        <AnimatePresence>
          {showEmailModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#fdfcfb] w-full max-w-md p-10 relative shadow-2xl border border-black"
              >
                <button 
                  onClick={() => setShowEmailModal(false)}
                  className="absolute top-6 right-6 text-black/40 hover:text-black cursor-pointer"
                >
                  <X size={20} />
                </button>

                {!captureSuccess ? (
                  <>
                    <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 mb-6 italic">Secure Delivery</h2>
                    <h3 className="font-serif text-3xl italic mb-6 leading-tight">Archive this <br />diagnostic audit.</h3>
                    <p className="text-sm text-gray-600 font-serif italic mb-8">
                      Enter your workspace email to receive the full narrative, competitor breakdown, and actionable priority vector.
                    </p>
                    
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <div className="border border-black p-4 bg-white">
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com" 
                          className="w-full bg-transparent outline-none font-serif italic text-lg"
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isCapturingEmail}
                        className="w-full bg-black text-white py-4 text-[10px] uppercase tracking-[0.3em] font-black italic hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isCapturingEmail ? <Loader2 size={14} className="animate-spin" /> : "Transmit Report"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-6"
                    >
                      <CheckCircle2 size={32} />
                    </motion.div>
                    <h3 className="font-serif text-3xl italic mb-4">Transmission Success.</h3>
                    <p className="text-sm text-gray-600 font-serif italic">
                      Check your inbox. Your RankLogic audit is on its way.
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-[#1a1a1a]/10 px-12 flex items-center justify-between text-[9px] text-gray-400 uppercase tracking-widest bg-[#fdfcfb]">
        <div className="flex items-center gap-6">
          <span>SCAN_AUTH: {(Math.random()*1000).toFixed(0)}-AX-26</span>
          <span className="hidden sm:inline border-l border-gray-200 pl-6 underline underline-offset-4 decoration-gray-200">System Ready</span>
        </div>
        <div className="flex space-x-6 items-center">
          <div className="flex space-x-2">
            <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          </div>
          <span className="hidden sm:inline">Refresh rate: Real-time</span>
        </div>
      </footer>
    </div>
  );
}
