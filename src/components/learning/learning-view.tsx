'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { BookMarked, Pen, Volume2, Eraser, Download, RotateCcw, Palette } from 'lucide-react';

const ARABIC_LETTERS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');

const NOOR_LEVELS = [
  {
    level: 1,
    title: 'الحروف المفردة',
    description: 'تعلم الحروف العربية بشكل مفرد',
    items: ARABIC_LETTERS.map(l => ({ char: l, label: l })),
  },
  {
    level: 2,
    title: 'الحروف بالفتحة',
    description: 'تعلم الحروف مع فتحه',
    items: ARABIC_LETTERS.map(l => ({ char: `${l}\u064E`, label: `${l}َ` })),
  },
  {
    level: 3,
    title: 'الحروف بالكسرة',
    description: 'تعلم الحروف مع كسره',
    items: ARABIC_LETTERS.map(l => ({ char: `${l}\u0650`, label: `${l}\u0650` })),
  },
  {
    level: 4,
    title: 'الحروف بالضمة',
    description: 'تعلم الحروف مع ضمه',
    items: ARABIC_LETTERS.map(l => ({ char: `${l}\u064F`, label: `${l}\u064F` })),
  },
  {
    level: 5,
    title: 'تدريب الجمل',
    description: 'تدريب على قراءة الجمل البسيطة',
    items: [
      { char: 'بِسْمِ اللَّهِ', label: 'بِسْمِ اللَّهِ' },
      { char: 'الْحَمْدُ لِلَّهِ', label: 'الْحَمْدُ لِلَّهِ' },
      { char: 'مَا شَاءَ اللَّهُ', label: 'مَا شَاءَ اللَّهُ' },
      { char: 'سُبْحَانَ اللَّهِ', label: 'سُبْحَانَ اللَّهِ' },
      { char: 'لَا إِلَهَ إِلَّا اللَّهُ', label: 'لَا إِلَهَ إِلَّا اللَّهُ' },
      { char: 'اللَّهُ أَكْبَرُ', label: 'اللَّهُ أَكْبَرُ' },
    ],
  },
];

const TRACE_CHARS = [...ARABIC_LETTERS, ...'0123456789'.split(''), ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export function LearningView() {
  const [activeTab, setActiveTab] = useState('noor');
  const [noorLevel, setNoorLevel] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  // Writing Lab State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#10b981');
  const [brushSize, setBrushSize] = useState([4]);
  const [traceChar, setTraceChar] = useState('ا');

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.7;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Canvas drawing logic
  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineWidth = brushSize[0];
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw trace character
    ctx.font = '180px Cairo, sans-serif';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(traceChar, canvas.width / 2, canvas.height / 2);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `writing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('تم حفظ الرسم');
  };

  useEffect(() => {
    if (activeTab === 'writing') {
      setTimeout(clearCanvas, 100);
    }
  }, [traceChar, activeTab]);

  const colors = ['#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000'];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">التعلم التفاعلي</h1>
        <p className="text-muted-foreground text-sm mt-1">نور البيان ومختبر الكتابة التفاعلي</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="noor" className="flex items-center gap-2">
            <BookMarked className="w-4 h-4" />
            نور البيان
          </TabsTrigger>
          <TabsTrigger value="writing" className="flex items-center gap-2">
            <Pen className="w-4 h-4" />
            مختبر الكتابة
          </TabsTrigger>
        </TabsList>

        {/* Noor Al-Bayan */}
        <TabsContent value="noor" className="space-y-4">
          {/* Level Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {NOOR_LEVELS.map((level, i) => (
              <Button
                key={i}
                variant={noorLevel === i ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNoorLevel(i)}
                className={noorLevel === i ? 'bg-gradient-to-l from-emerald-500 to-teal-600 text-white' : ''}
              >
                المستوى {level.level}
              </Button>
            ))}
          </div>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{NOOR_LEVELS[noorLevel].title}</CardTitle>
              <p className="text-sm text-muted-foreground">{NOOR_LEVELS[noorLevel].description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {NOOR_LEVELS[noorLevel].items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => speak(item.char)}
                    className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 active:scale-95"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Writing Lab */}
        <TabsContent value="writing" className="space-y-4">
          {/* Controls */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">حرف للتتبع</label>
                  <div className="flex gap-1.5 flex-wrap max-w-[300px]">
                    {TRACE_CHARS.slice(0, 28).map(c => (
                      <button
                        key={c}
                        onClick={() => { setTraceChar(c); speak(c); }}
                        className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                          traceChar === c ? 'bg-emerald-500 text-white scale-110' : 'bg-muted hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">اللون</label>
                  <div className="flex gap-1.5">
                    {colors.map(c => (
                      <button
                        key={c}
                        onClick={() => setBrushColor(c)}
                        className={`w-7 h-7 rounded-full transition-all ${brushColor === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1 w-32">
                  <label className="text-xs font-medium text-muted-foreground">الحجم: {brushSize[0]}</label>
                  <Slider value={brushSize} onValueChange={setBrushSize} min={1} max={20} step={1} />
                </div>
                <div className="flex gap-2 mr-auto">
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    <Eraser className="w-3.5 h-3.5 ml-1" />مسح
                  </Button>
                  <Button variant="outline" size="sm" onClick={saveCanvas}>
                    <Download className="w-3.5 h-3.5 ml-1" />حفظ
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => speak(traceChar)}>
                    <Volume2 className="w-3.5 h-3.5 ml-1" />نطق
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canvas */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="border-2 border-dashed border-emerald-200 dark:border-emerald-800/30 rounded-2xl overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={500}
                  className="w-full touch-none cursor-crosshair bg-white dark:bg-card"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
