import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Heart, Instagram, Twitter, Youtube, Headphones, Mail, Sparkles, AlertTriangle } from 'lucide-react';

const Footer: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setClickCount(0);
      navigate('/lu-admin-secret');
    }
  };

  return (
    <footer className="relative bg-[#0a0a0f] border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Music className="w-10 h-10 text-pink-500" />
                <div className="absolute inset-0 w-10 h-10 bg-pink-500 blur-xl opacity-50" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#ff0080] drop-shadow-[0_0_20px_rgba(255,0,128,0.6)]">
                  WhoIsLu
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Neon Pink Flames</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-white/5 hover:bg-pink-500/20 rounded-lg transition-colors group">
                <Instagram className="w-5 h-5 text-gray-400 group-hover:text-pink-400" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-pink-500/20 rounded-lg transition-colors group">
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-pink-400" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-pink-500/20 rounded-lg transition-colors group">
                <Youtube className="w-5 h-5 text-gray-400 group-hover:text-pink-400" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-pink-500/20 rounded-lg transition-colors group">
                <Headphones className="w-5 h-5 text-gray-400 group-hover:text-pink-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#tracks" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  All Tracks
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  About WhoIsLu
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  The Project
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                  Behind the Scenes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-pink-400" />
              Stay Connected
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Get updates on the album release and exclusive content.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500/50"
              />
              <button className="px-4 py-2 bg-pink-500 hover:bg-pink-400 rounded-lg text-white text-sm font-medium transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-xs leading-relaxed">
              <span className="text-pink-400 font-semibold">Copyright Notice:</span> All music, artwork, and content on this website are protected by copyright law. 
              Unauthorized reproduction, distribution, public performance, or any other use of the materials without explicit written permission from WhoIsLu is strictly prohibited. 
              All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p 
            className="text-gray-500 text-sm cursor-default select-none"
            onClick={handleSecretClick}
          >
            © 2025 WhoIsLu. All rights reserved.
          </p>
          <p className="text-gray-600 text-sm flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-pink-500" /> in the Lu.niverse
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;