'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  BookOpen, Video, Music, FileText, Link2, Gamepad2, 
  Plus, Search, Play, Eye, Edit, Trash2, Star, Users, 
  BookMarked, Heart, Sparkles, Headphones, Image
} from 'lucide-react';
import type { LearningMaterial } from '@/types';

const CATEGORIES = [
  { value: 'all', label: 'جميع الفئات', icon: BookOpen, color: 'from-slate-500 to-slate-600' },
  { value: 'tajweed', label: 'أحكام التجويد', icon: BookMarked, color: 'from-emerald-500 to-teal-600' },
  { value: 'memorization', label: 'مساعدة الحفظ', icon: Star, color: 'from-amber-500 to-orange-600' },
  { value: 'quran', label: 'تلاوة القرآن', icon: BookOpen, color: 'from-green-500 to-emerald-600' },
  { value: 'dua', label: 'الأذكار والأدعية', icon: Heart, color: 'from-rose-500 to-pink-600' },
  { value: 'activity', label: 'أنشطة تعليمية', icon: Gamepad2, color: 'from-violet-500 to-purple-600' },
  { value: 'story', label: 'قصص إسلامية', icon: Sparkles, color: 'from-blue-500 to-indigo-600' },
];

const TYPES = [
  { value: 'video', label: 'فيديو', icon: Video },
  { value: 'audio', label: 'صوتي', icon: Headphones },
  { value: 'pdf', label: 'ملف PDF', icon: FileText },
  { value: 'image', label: 'صورة', icon: Image },
  { value: 'link', label: 'رابط خارجي', icon: Link2 },
  { value: 'interactive', label: 'تفاعلي', icon: Gamepad2 },
];

const LEVELS = [
  { value: 'all', label: 'جميع المستويات' },
  { value: 'beginner', label: 'مبتدئ (3-5 سنوات)' },
  { value: 'intermediate', label: 'متوسط (5-7 سنوات)' },
  { value: 'advanced', label: 'متقدم (7-10 سنوات)' },
];

function TypeIcon({ type }: { type: string }) {
  const t = TYPES.find(x => x.value === type);
  if (!t) return <BookOpen className="w-5 h-5" />;
  const Icon = t.icon;
  return <Icon className="w-5 h-5" />;
}

function CategoryBadge({ category }: { category: string }) {
  const c = CATEGORIES.find(x => x.value === category);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-l ${c?.color || 'from-slate-500 to-slate-600'}`}>
      {c?.label || category}
    </span>
  );
}

// Embedded rich content for demo - YouTube/Islamic resources
const DEMO_MATERIALS: Partial<LearningMaterial>[] = [
  {
    id: 'demo-1',
    title: 'تعلم حروف الهجاء مع نور البيان',
    description: 'فيديو تعليمي ممتع لتعلم الحروف العربية بطريقة نور البيان مع أصوات واضحة وألوان جذابة للأطفال',
    category: 'tajweed',
    type: 'video',
    url: 'https://www.youtube.com/embed/LTx9ERjOdY4',
    level: 'beginner',
    ageGroup: '3-5',
    duration: 15,
    viewCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'سورة الفاتحة - مكررة للحفظ',
    description: 'تلاوة سورة الفاتحة مكررة ببطء للمساعدة في الحفظ مع توضيح مخارج الحروف',
    category: 'quran',
    type: 'video',
    url: 'https://www.youtube.com/embed/WTgHPiAlHrc',
    level: 'beginner',
    ageGroup: '3-7',
    surahNumber: 1,
    surahName: 'الفاتحة',
    duration: 10,
    viewCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: 'أذكار الصباح للأطفال',
    description: 'تعليم أذكار الصباح والمساء بأسلوب ممتع وبسيط يناسب الأطفال في سن الحضانة',
    category: 'dua',
    type: 'video',
    url: 'https://www.youtube.com/embed/mhJMFMi6JME',
    level: 'beginner',
    ageGroup: '3-7',
    duration: 12,
    viewCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: 'قصة النبي يوسف للأطفال',
    description: 'قصة سيدنا يوسف عليه السلام بأسلوب مبسط وممتع مناسب للأطفال',
    category: 'story',
    type: 'video',
    url: 'https://www.youtube.com/embed/9KfPj-pmlNE',
    level: 'intermediate',
    ageGroup: '5-10',
    duration: 20,
    viewCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: 'تعلم أحكام النون الساكنة والتنوين',
    description: 'شرح مبسط لأحكام التجويد - النون الساكنة والتنوين مع أمثلة من القرآن الكريم',
    category: 'tajweed',
    type: 'video',
    url: 'https://www.youtube.com/embed/A3V0ABGV3xI',
    level: 'intermediate',
    ageGroup: '5-10',
    duration: 18,
    viewCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    title: 'نشيد الطفل المسلم',
    description: 'أناشيد إسلامية تربوية للأطفال تعزز القيم الإسلامية وحب القرآن',
    category: 'activity',
    type: 'video',
    url: 'https://www.youtube.com/embed/hKLV3HrVotI',
    level: 'all',
    ageGroup: '3-10',
    duration: 25,
    viewCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export function MaterialsView() {
  const [materials, setMaterials] = useState<Partial<LearningMaterial>[]>(DEMO_MATERIALS);
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Partial<LearningMaterial> | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);

  const filtered = materials.filter(m => {
    if (category !== 'all' && m.category !== category) return false;
    if (level !== 'all' && m.level !== level && m.level !== 'all') return false;
    if (search && !m.title?.includes(search) && !m.description?.includes(search)) return false;
    return true;
  });

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    const fd = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(fd.entries());
    
    // Add to local state for immediate feedback
    const newMaterial: Partial<LearningMaterial> = {
      id: `local-${Date.now()}`,
      ...data,
      viewCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    try {
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setMaterials(prev => [result.material || newMaterial, ...prev]);
        toast.success('تم إضافة المادة التعليمية بنجاح');
      } else {
        setMaterials(prev => [newMaterial, ...prev]);
        toast.success('تم الإضافة (ستُحفظ عند المزامنة)');
      }
    } catch {
      setMaterials(prev => [newMaterial, ...prev]);
      toast.success('تم الإضافة محلياً');
    }
    
    setShowAdd(false);
    setAdding(false);
  };

  return (
    <div className="space-y-6 animate-fade-in-up" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </span>
            المواد التعليمية
          </h1>
          <p className="text-muted-foreground text-sm mt-1">مكتبة تعليمية إسلامية لتقوية مهارات الحفظ والتجويد</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-l from-violet-500 to-purple-600 text-white shadow-lg gap-2">
              <Plus className="w-4 h-4" />
              إضافة مادة تعليمية
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مادة تعليمية جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">عنوان المادة *</label>
                <Input name="title" placeholder="مثال: تعلم سورة الفاتحة" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الوصف</label>
                <Input name="description" placeholder="وصف مختصر للمادة التعليمية" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الفئة</label>
                  <Select name="category" defaultValue="quran">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">النوع</label>
                  <Select name="type" defaultValue="video">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط الفيديو/المحتوى *</label>
                <Input name="url" placeholder="https://www.youtube.com/embed/..." required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المستوى</label>
                  <Select name="level" defaultValue="all">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">الفئة العمرية</label>
                  <Input name="ageGroup" placeholder="3-7" defaultValue="3-7" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المدة (دقائق)</label>
                  <Input name="duration" type="number" placeholder="15" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم السورة (اختياري)</label>
                  <Input name="surahName" placeholder="الفاتحة" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الكلمات المفتاحية</label>
                <Input name="tags" placeholder="تجويد، حفظ، أطفال" />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-l from-violet-500 to-purple-600 text-white" disabled={adding}>
                {adding ? 'جاري الإضافة...' : 'إضافة المادة'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? `bg-gradient-to-l ${cat.color} text-white shadow-lg`
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث في المواد التعليمية..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="المستوى" /></SelectTrigger>
          <SelectContent>
            {LEVELS.map(l => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي المواد', value: materials.length, color: 'text-violet-600' },
          { label: 'مرئية اليوم', value: filtered.length, color: 'text-emerald-600' },
          { label: 'فئات مختلفة', value: CATEGORIES.length - 1, color: 'text-amber-600' },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Materials Grid */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">لا توجد مواد تعليمية في هذه الفئة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((material) => {
            const cat = CATEGORIES.find(c => c.value === material.category);
            return (
              <Card key={material.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                {/* Thumbnail / Preview */}
                <div className={`h-36 bg-gradient-to-br ${cat?.color || 'from-slate-400 to-slate-600'} relative flex items-center justify-center`}>
                  {material.type === 'video' && material.url && material.url.includes('youtube') ? (
                    <div className="absolute inset-0 bg-black/20" />
                  ) : null}
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TypeIcon type={material.type || 'video'} />
                    </div>
                    {material.duration && (
                      <span className="text-white/80 text-xs font-medium">{material.duration} دقيقة</span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <CategoryBadge category={material.category || 'quran'} />
                  </div>
                  {material.level && material.level !== 'all' && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                        {LEVELS.find(l => l.value === material.level)?.label?.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm line-clamp-2 leading-relaxed">{material.title}</h3>
                    {material.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{material.description}</p>
                    )}
                  </div>
                  
                  {material.surahName && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      سورة {material.surahName}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {material.ageGroup} سنوات
                    </div>
                    <Button
                      size="sm"
                      className={`h-8 text-xs bg-gradient-to-l ${cat?.color || 'from-slate-500 to-slate-600'} text-white gap-1.5`}
                      onClick={() => setSelectedMaterial(material)}
                    >
                      <Play className="w-3 h-3" />
                      عرض
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Material Viewer Dialog */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">{selectedMaterial?.title}</DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4">
              {selectedMaterial.type === 'video' && selectedMaterial.url && (
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={selectedMaterial.url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={selectedMaterial.title}
                  />
                </div>
              )}
              {selectedMaterial.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedMaterial.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={selectedMaterial.category || 'quran'} />
                {selectedMaterial.level && (
                  <Badge variant="outline">{LEVELS.find(l => l.value === selectedMaterial.level)?.label}</Badge>
                )}
                {selectedMaterial.duration && (
                  <Badge variant="outline">{selectedMaterial.duration} دقيقة</Badge>
                )}
                {selectedMaterial.ageGroup && (
                  <Badge variant="outline">للأعمار {selectedMaterial.ageGroup} سنوات</Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
