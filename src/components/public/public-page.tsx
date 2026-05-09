'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen, Users, GraduationCap, Award, Star, Phone, MapPin, Clock,
  ChevronLeft, Heart, Sparkles, Moon, Sun, CheckCircle2, ArrowLeft,
  MessageCircle, Shield, Zap, Globe
} from 'lucide-react';
import { AnimatedBackground } from './animated-background';

interface PublicStats {
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  totalMemorization: number;
}

export function PublicPage({ onLogin, onPortalAccess }: { onLogin: () => void; onPortalAccess?: () => void }) {
  const [stats, setStats] = useState<PublicStats>({ totalStudents: 0, totalClasses: 0, totalTeachers: 0, totalMemorization: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    fetch('/api/public-stats')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setStats(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach(ref => observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  };

  const isVisible = (id: string) => visibleSections.has(id);

  const programs = [
    {
      icon: BookOpen,
      title: 'حفظ القرآن الكريم',
      description: 'برنامج متكامل لحفظ كتاب الله تعالى بالتجويد والترتيل، مع متابعة مستمرة وتقييم دوري لضمان إتقان الحفظ والمراجعة المستمرة.',
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      icon: Sparkles,
      title: 'نور البيان',
      description: 'منهج علمي متخصص لتعليم أحكام التجويد وقواعد القراءة الصحيحة، يبدأ من المستوى التأسيسي وحتى الإتقان في التلاوة.',
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: Award,
      title: 'السبق والمراجعة',
      description: 'نظام متابعة يومي للحفظ الجديد والمراجعة القريبة والبعيدة، مع تقييم أداء الطلاب ومنحهم درجات التميز والشهادات.',
      color: 'from-teal-500 to-cyan-600',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
      icon: Heart,
      title: 'الأنشطة التربوية',
      description: 'برامج تربوية وأنشطة مساندة تشمل المسابقات القرآنية والرحلات التعليمية والفعاليات الموسمية التي تعزز ارتباط الطالب بالقرآن.',
      color: 'from-rose-500 to-pink-600',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
    },
  ];

  const features = [
    { icon: Shield, title: 'بيئة تعليمية آمنة', desc: 'رعاية متكاملة في بيئة آمنة ومحفزة تحت إشراف معلمين متخصصين' },
    { icon: Users, title: 'معلمون مؤهلون', desc: 'كادر تعليمي متخصص في علوم القرآن والتجويد ذو خبرة طويلة' },
    { icon: Zap, title: 'متابعة مستمرة', desc: 'نظام متابعة إلكتروني لأولياء الأمور للاطلاع على مستوى أبنائهم' },
    { icon: Globe, title: 'تقارير دورية', desc: 'تقارير مفصلة عن مستوى الحفظ والحضور والسلوك ترسل بانتظام' },
  ];

  const statItems = [
    { value: stats.totalStudents, label: 'طالب وطالبة', icon: Users, color: 'text-emerald-600' },
    { value: stats.totalClasses, label: 'فصل دراسي', icon: GraduationCap, color: 'text-teal-600' },
    { value: stats.totalTeachers, label: 'معلم ومعلمة', icon: Star, color: 'text-amber-600' },
    { value: stats.totalMemorization, label: 'سجل حفظ', icon: BookOpen, color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen relative">
      {/* ===== Animated Canvas Background ===== */}
      <AnimatedBackground />

      {/* ===== Animated CSS Background Layer ===== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Large floating orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-400/8 dark:bg-emerald-400/5 blur-3xl floating-orb-1" />
        <div className="absolute top-1/3 -left-48 w-[600px] h-[600px] rounded-full bg-teal-400/6 dark:bg-teal-400/4 blur-3xl floating-orb-2" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-400/5 dark:bg-amber-400/3 blur-3xl floating-orb-3" />
        <div className="absolute top-2/3 -left-20 w-[350px] h-[350px] rounded-full bg-cyan-400/5 dark:bg-cyan-400/3 blur-3xl floating-orb-1" style={{ animationDelay: '-5s' }} />
        <div className="absolute -bottom-20 right-1/3 w-[450px] h-[450px] rounded-full bg-emerald-300/6 dark:bg-emerald-300/3 blur-3xl floating-orb-2" style={{ animationDelay: '-10s' }} />

        {/* Floating geometric Islamic shapes */}
        <svg className="absolute top-[10%] right-[8%] w-16 h-16 text-emerald-500/[0.06] floating-shape-1" viewBox="0 0 40 40">
          <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor" />
        </svg>
        <svg className="absolute top-[25%] left-[5%] w-20 h-20 text-teal-500/[0.05] floating-shape-2" viewBox="0 0 40 40">
          <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor" />
        </svg>
        <svg className="absolute top-[50%] right-[15%] w-12 h-12 text-amber-500/[0.06] floating-shape-3" viewBox="0 0 40 40">
          <polygon points="20,0 40,15 32,38 8,38 0,15" fill="currentColor" />
        </svg>
        <svg className="absolute top-[70%] left-[20%] w-14 h-14 text-emerald-400/[0.05] floating-shape-1" viewBox="0 0 40 40" style={{ animationDelay: '-3s' }}>
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M20 2L20 38M2 20L38 20" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg className="absolute top-[40%] left-[40%] w-10 h-10 text-teal-400/[0.04] floating-shape-2" viewBox="0 0 40 40" style={{ animationDelay: '-7s' }}>
          <path d="M20 0L40 20L20 40L0 20Z" fill="currentColor" />
        </svg>
        <svg className="absolute top-[85%] right-[30%] w-18 h-18 text-amber-400/[0.04] floating-shape-3" viewBox="0 0 40 40" style={{ animationDelay: '-4s' }}>
          <polygon points="20,0 40,15 32,38 8,38 0,15" fill="currentColor" />
        </svg>

        {/* Islamic 8-pointed stars */}
        <svg className="absolute top-[15%] left-[25%] w-24 h-24 text-emerald-500/[0.04] rotate-slow" viewBox="0 0 100 100">
          <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="currentColor" />
        </svg>
        <svg className="absolute top-[60%] right-[8%] w-32 h-32 text-teal-500/[0.03] rotate-slow" viewBox="0 0 100 100" style={{ animationDirection: 'reverse' }}>
          <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="currentColor" />
        </svg>
        <svg className="absolute top-[35%] left-[70%] w-20 h-20 text-amber-500/[0.03] rotate-slow" viewBox="0 0 100 100" style={{ animationDuration: '45s' }}>
          <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="currentColor" />
        </svg>

        {/* Breathing glow spots */}
        <div className="absolute top-[20%] left-[50%] w-48 h-48 bg-emerald-500/[0.04] rounded-full blur-3xl breathe-glow" />
        <div className="absolute top-[55%] left-[30%] w-36 h-36 bg-teal-500/[0.04] rounded-full blur-3xl breathe-glow" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[80%] right-[20%] w-40 h-40 bg-amber-500/[0.03] rounded-full blur-3xl breathe-glow" style={{ animationDelay: '-4s' }} />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer-bg" />

        {/* Subtle moving wave lines */}
        <svg className="absolute bottom-0 left-0 w-full h-64 opacity-[0.03] wave-float" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="oklch(0.55 0.15 160)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-48 opacity-[0.02] wave-float" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ animationDelay: '-5s' }}>
          <path fill="oklch(0.65 0.15 85)" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,234.7C672,256,768,288,864,282.7C960,277,1056,235,1152,213.3C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z" />
        </svg>
      </div>

      {/* ===== Main Content ===== */}
      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-emerald-500/5'
            : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="font-bold text-sm sm:text-base text-foreground">
                    براعم القرآن الكريم
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">مجمع التوحيد بالعباسة</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <a href="#contact" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  تواصل معنا
                </a>
                {onPortalAccess && (
                  <Button
                    onClick={onPortalAccess}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 gap-2 text-xs sm:text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="hidden sm:inline">بوابة ولي الأمر</span>
                    <span className="sm:hidden">ولي الأمر</span>
                  </Button>
                )}
                <Button
                  onClick={onLogin}
                  className="bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 gap-2 text-sm sm:text-base"
                >
                  <span>تسجيل الدخول</span>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center space-y-8">
              {/* Bismillah */}
              <div className="animate-fade-in-up">
                <span className="inline-block text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                  بسم الله الرحمن الرحيم
                </span>
              </div>

              {/* Main heading */}
              <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">
                  <span className="gradient-text">براعم تحفيظ</span>
                  <br />
                  <span className="text-foreground">القرآن الكريم</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  نربي أجيالاً على كتاب الله، بحفظ متقن وتجويد صحيح وتربية إسلامية في بيئة محفزة ورعاية متكاملة
                </p>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Button
                  onClick={onLogin}
                  size="lg"
                  className="bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/25 w-full sm:w-auto text-lg h-14 px-8 gap-2"
                >
                  <span>دخول النظام</span>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <a href="#programs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20 w-full sm:w-auto text-lg h-14 px-8 gap-2"
                  >
                    <span>تعرف على برامجنا</span>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </a>
              </div>

              {/* Verse quote */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                <div className="inline-block bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-emerald-100 dark:border-emerald-900/30 shadow-lg">
                  <p className="text-emerald-800 dark:text-emerald-300 text-base sm:text-lg font-semibold">
                    ﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">سورة الحجر - الآية 9</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" ref={setSectionRef('stats')} className="py-12 sm:py-16 bg-white/40 dark:bg-gray-900/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statItems.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className={`text-center space-y-3 p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-lg shadow-emerald-500/5 border border-emerald-50 dark:border-emerald-900/20 transition-all duration-700 hover:-translate-y-1 hover:shadow-xl ${
                      isVisible('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl sm:text-4xl font-black gradient-text">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section id="programs" ref={setSectionRef('programs')} className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center space-y-4 mb-12 transition-all duration-700 ${isVisible('programs') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                برامجنا التعليمية
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">برامج متخصصة لحفظ كتاب الله</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                نقدم مجموعة متكاملة من البرامج التعليمية المصممة بعناية لتناسب جميع المستويات والأعمار، تحت إشراف أفضل المعلمين المتخصصين
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {programs.map((program, i) => {
                const Icon = program.icon;
                return (
                  <Card
                    key={i}
                    className={`group border-0 shadow-lg hover:shadow-xl transition-all duration-700 overflow-hidden hover:-translate-y-1 bg-white/80 dark:bg-card/80 backdrop-blur-sm ${
                      isVisible('programs') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                  >
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-3 flex-1">
                          <h3 className="text-xl font-bold">{program.title}</h3>
                          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                            {program.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" ref={setSectionRef('features')} className="py-16 sm:py-24 bg-gradient-to-b from-emerald-50/20 to-teal-50/20 dark:from-emerald-950/10 dark:to-teal-950/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center space-y-4 mb-12 transition-all duration-700 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                لماذا تختارنا
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">مميزات تجعلنا الأفضل</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                نسعى دائماً لتقديم أفضل تجربة تعليمية من خلال مزيج من الأصالة والحداثة في أساليب التعليم
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className={`text-center space-y-4 p-6 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-md border border-emerald-50 dark:border-emerald-900/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-700 ${
                      isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Daily Schedule Section */}
        <section id="schedule" ref={setSectionRef('schedule')} className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center space-y-4 mb-12 transition-all duration-700 ${isVisible('schedule') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4" />
                الجدول اليومي
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">يوم الطالب في براعم القرآن</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { time: '٤:٠٠ م', title: 'حلقة المراجعة', desc: 'مراجعة المحفوظ السابق مع المعلم', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
                { time: '٤:٣٠ م', title: 'السبق الجديد', desc: 'عرض الحفظ الجديد على المعلم وتصحيح التلاوة', icon: Sparkles, color: 'from-amber-500 to-orange-600' },
                { time: '٥:٠٠ م', title: 'السبقي (المراجعة القريبة)', desc: 'مراجعة ما تم حفظه في الأيام القليلة الماضية', icon: CheckCircle2, color: 'from-teal-500 to-cyan-600' },
                { time: '٥:٣٠ م', title: 'المنزل (المراجعة البعيدة)', desc: 'مراجعة الأجزاء المحفوظة سابقاً للحفاظ على التثبيت', icon: Award, color: 'from-rose-500 to-pink-600' },
                { time: '٦:٠٠ م', title: 'نور البيان والتجويد', desc: 'تطبيق أحكام التجويد وتدريب على القراءة الصحيحة', icon: Moon, color: 'from-violet-500 to-purple-600' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-md border border-emerald-50 dark:border-emerald-900/20 hover:shadow-lg transition-all duration-700 ${
                      isVisible('schedule') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {item.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={setSectionRef('cta')} className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`relative rounded-3xl overflow-hidden transition-all duration-700 ${isVisible('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <pattern id="ctaPattern" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
                    <path d="M7.5 0L15 7.5L7.5 15L0 7.5Z" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                  <rect width="100" height="100" fill="url(#ctaPattern)" />
                </svg>
              </div>
              {/* Animated glow in CTA */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl breathe-glow" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-teal-300/15 rounded-full blur-3xl breathe-glow" style={{ animationDelay: '-3s' }} />

              <div className="relative text-center space-y-6 p-8 sm:p-12 lg:p-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                  سجّل ابنك الآن في براعم القرآن
                </h2>
                <p className="text-emerald-100 text-lg max-w-xl mx-auto leading-relaxed">
                  لا تفوّت فرصة تحفيظ ابنك كتاب الله في بيئة تعليمية متخصصة ورعاية متكاملة. التسجيل متاح الآن للفصل الدراسي الجديد.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={onLogin}
                    size="lg"
                    className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-xl w-full sm:w-auto text-lg h-14 px-8 gap-2 font-bold"
                  >
                    <span>تسجيل الدخول</span>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <a href="#contact">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto text-lg h-14 px-8 gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>تواصل معنا</span>
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" ref={setSectionRef('contact')} className="py-16 sm:py-24 bg-gradient-to-b from-teal-50/20 to-emerald-50/20 dark:from-teal-950/10 dark:to-emerald-950/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center space-y-4 mb-12 transition-all duration-700 ${isVisible('contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 px-4 py-2 rounded-full text-sm font-medium">
                <MessageCircle className="w-4 h-4" />
                تواصل معنا
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">نرحب بتواصلكم</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                للاستفسار عن برامجنا أو التسجيل، يمكنكم التواصل معنا من خلال أي من الطرق التالية
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className={`text-center space-y-4 p-6 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-md border border-emerald-50 dark:border-emerald-900/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-700 ${
                isVisible('contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg">العنوان</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  مجمع التوحيد بالعباسة<br />
                  محافظة الشرقية
                </p>
              </div>

              <div className={`text-center space-y-4 p-6 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-md border border-emerald-50 dark:border-emerald-900/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-700 ${
                isVisible('contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '100ms' }}>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg">الهاتف</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  للتواصل والاستفسار<br />
                  <span dir="ltr" className="font-medium text-foreground">01012345678</span>
                </p>
              </div>

              <div className={`text-center space-y-4 p-6 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-md border border-emerald-50 dark:border-emerald-900/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-700 ${
                isVisible('contact') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '200ms' }}>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg">مواعيد العمل</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  السبت - الخميس<br />
                  <span className="font-medium text-foreground">٤:٠٠ م - ٧:٠٠ م</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gradient-to-b from-emerald-900 to-teal-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm">براعم تحفيظ القرآن الكريم</p>
                  <p className="text-xs text-emerald-300">مجمع التوحيد بالعباسة</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-emerald-200">
                <a href="#programs" className="hover:text-white transition-colors">البرامج</a>
                <a href="#features" className="hover:text-white transition-colors">المميزات</a>
                <a href="#contact" className="hover:text-white transition-colors">تواصل معنا</a>
              </div>
              <p className="text-xs text-emerald-400">
                جميع الحقوق محفوظة &copy; {new Date().getFullYear()} براعم القرآن
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
