import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Save, ChevronLeft, ChevronRight } from 'lucide-react';

export interface StorySlide {
  id: string;
  imageUrl: string;
  text: string;
  title: string;
}

interface OurStoryCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const OurStoryCustomizer: React.FC<OurStoryCustomizerProps> = ({ isOpen, onClose }) => {
  const [slides, setSlides] = useState<StorySlide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const savedStory = localStorage.getItem('wedding_our_story');
      if (savedStory) {
        setSlides(JSON.parse(savedStory));
      } else {
        // Default initial slide if empty
        setSlides([
          {
            id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&auto=format&fit=crop',
            title: 'How We Met',
            text: 'It all started with a chance encounter...'
          }
        ]);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('wedding_our_story', JSON.stringify(slides));
    
    // Broadcast update to guests so they see it immediately if online
    const channel = new BroadcastChannel('wedding_story_update');
    channel.postMessage({ type: 'story_updated', slides });
    channel.close();
    
    alert('Story saved successfully!');
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newSlides = [...slides];
        newSlides[activeSlideIndex].imageUrl = reader.result as string;
        setSlides(newSlides);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSlide = (field: keyof StorySlide, value: string) => {
    const newSlides = [...slides];
    (newSlides[activeSlideIndex] as any)[field] = value;
    setSlides(newSlides);
  };

  const addNewSlide = () => {
    const newSlide: StorySlide = {
      id: Date.now().toString(),
      imageUrl: 'https://images.unsplash.com/photo-1511285560982-1351cdeb9821?w=800&auto=format&fit=crop',
      title: 'New Chapter',
      text: 'Add your story details here...'
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      alert("You must have at least one slide.");
      return;
    }
    const newSlides = slides.filter((_, i) => i !== activeSlideIndex);
    setSlides(newSlides);
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-[#fffbf5] flex flex-col animate-in slide-in-from-bottom duration-500">
      <div className="bg-[#4a0e11] p-4 flex justify-between items-center text-white shadow-md z-10">
        <h2 className="font-serif text-xl font-bold">Customize Our Story</h2>
        <button onClick={onClose}><X size={24} /></button>
      </div>

      <div className="flex-grow overflow-y-auto p-6 pb-32">
        {/* Slide Preview & Navigation */}
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden aspect-[4/5] mb-6 border-4 border-gold-200">
          {slides.length > 0 && (
            <>
              <img 
                src={slides[activeSlideIndex].imageUrl} 
                alt="Slide" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                <h3 className="text-2xl font-heading mb-2 drop-shadow-md">{slides[activeSlideIndex].title}</h3>
                <p className="text-sm font-serif opacity-90 line-clamp-3 drop-shadow-sm">{slides[activeSlideIndex].text}</p>
              </div>
              
              {/* Navigation Arrows */}
              {activeSlideIndex > 0 && (
                  <button onClick={() => setActiveSlideIndex(prev => prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-black/50 text-white backdrop-blur-sm">
                      <ChevronLeft size={24} />
                  </button>
              )}
              {activeSlideIndex < slides.length - 1 && (
                  <button onClick={() => setActiveSlideIndex(prev => prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-black/50 text-white backdrop-blur-sm">
                      <ChevronRight size={24} />
                  </button>
              )}
            </>
          )}
        </div>

        {/* Editing Controls */}
        <div className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Slide {activeSlideIndex + 1} of {slides.length}</span>
                 <button onClick={deleteSlide} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"><Trash2 size={18} /></button>
             </div>

             <div>
                 <label className="block text-sm font-bold text-[#4a0e11] mb-1">Slide Image</label>
                 <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors">
                     <div className="w-12 h-12 bg-stone-200 rounded overflow-hidden flex-shrink-0">
                         <img src={slides[activeSlideIndex]?.imageUrl} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-grow">
                         <p className="text-sm font-bold text-stone-600">Change Image</p>
                         <p className="text-xs text-stone-400">Tap to upload</p>
                     </div>
                     <ImageIcon size={20} className="text-stone-400" />
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div>

             <div>
                 <label className="block text-sm font-bold text-[#4a0e11] mb-1">Title</label>
                 <input 
                    type="text" 
                    value={slides[activeSlideIndex]?.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-500 outline-none font-serif"
                 />
             </div>

             <div>
                 <label className="block text-sm font-bold text-[#4a0e11] mb-1">Story Text</label>
                 <textarea 
                    value={slides[activeSlideIndex]?.text}
                    onChange={(e) => updateSlide('text', e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:border-gold-500 outline-none font-serif resize-none"
                 />
             </div>
        </div>

        <button onClick={addNewSlide} className="w-full mt-6 py-4 border-2 border-dashed border-gold-400 text-gold-600 font-bold rounded-xl hover:bg-gold-50 transition-colors flex items-center justify-center gap-2">
            <Plus size={20} /> Add New Chapter
        </button>
      </div>

      <div className="p-4 bg-white border-t border-stone-200 absolute bottom-0 left-0 right-0 z-20">
          <button onClick={handleSave} className="w-full bg-[#4a0e11] text-gold-100 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-[#5e181f] transition-colors flex items-center justify-center gap-2">
              <Save size={20} /> Save & Publish Story
          </button>
      </div>
    </div>
  );
};

export default OurStoryCustomizer;