import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Headphones, Star, ArrowRight, MapPin } from 'lucide-react';
import HeroSearchForm from '@/components/features/HeroSearchForm';
import CarCard, { CarCardSkeleton } from '@/components/features/CarCard';
import { useFeaturedCars } from '@/hooks/useCarFilter';

// ─── Benefits data ─────────────────────────────────────────────────────
const BENEFITS = [
  {
    icon: Shield,
    title: 'Xe được bảo hiểm',
    desc: 'Tất cả xe đều có bảo hiểm dân sự, an tâm lái xe mọi hành trình.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Clock,
    title: 'Đặt xe 24/7',
    desc: 'Đặt xe online bất kỳ lúc nào, nhận xe nhanh trong 2 giờ.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ tận tình',
    desc: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn.',
    color: 'bg-orange-50 text-brand-500',
  },
  {
    icon: MapPin,
    title: 'Giao xe tận nơi',
    desc: 'Giao xe đến tận địa chỉ bạn muốn trong nội thành.',
    color: 'bg-purple-50 text-purple-600',
  },
];

const TESTIMONIALS = [
  { name: 'Nguyễn Văn Anh', rating: 5, text: 'Xe đẹp, sạch sẽ, thủ tục nhanh gọn. Sẽ tiếp tục ủng hộ!' },
  { name: 'Trần Thị Mai', rating: 5, text: 'Giá hợp lý, dịch vụ chuyên nghiệp. Rất hài lòng!' },
  { name: 'Lê Minh Đức', rating: 4, text: 'Nhân viên nhiệt tình, xe tốt. Đi Đà Lạt tuyệt vời.' },
];

// ─── Section: Hero ──────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      aria-label="Trang chủ hero"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1600&q=80"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80" />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-up">
          <Star className="w-4 h-4 fill-brand-400 text-brand-400" />
          Nền tảng cho thuê xe uy tín #1 Việt Nam
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
          Thuê xe tự lái{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-300">
            dễ dàng
          </span>{' '}
          & an toàn
        </h1>

        <p className="text-lg text-white/75 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '200ms' }}>
          Hàng trăm mẫu xe đa dạng, giá minh bạch, thủ tục đơn giản. Khám phá mọi hành trình cùng SkibidiCar!
        </p>

        {/* Search Form */}
        <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
          <HeroSearchForm />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-up" style={{ animationDelay: '400ms' }}>
          {[['500+', 'Xe đa dạng'], ['10,000+', 'Lượt thuê'], ['98%', 'Hài lòng']].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{num}</p>
              <p className="text-sm text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Benefits ──────────────────────────────────────────────────
function BenefitsSection() {
  return (
    <section className="py-20 bg-slate-50" aria-label="Lợi ích khi thuê xe tại SkibidiCar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">Tại sao chọn SkibidiCar?</h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm thuê xe tốt nhất cho bạn.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="card p-6 flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Featured Cars ─────────────────────────────────────────────
function FeaturedCarsSection() {
  const { data: cars, isLoading, isError } = useFeaturedCars();

  return (
    <section className="py-20" aria-label="Xe nổi bật">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">Xe nổi bật</h2>
            <p className="mt-2 text-slate-500">Những mẫu xe được khách hàng yêu thích nhất</p>
          </div>
          <Link to="/tim-xe" className="btn-outline py-2 px-4 text-sm hidden sm:flex">
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isError && (
          <div className="text-center py-16 text-slate-500">
            <p>Không thể tải danh sách xe. Vui lòng thử lại.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <CarCardSkeleton key={i} />)
            : cars?.map((car) => <CarCard key={car.id} car={car} />)
          }
        </div>

        <div className="text-center mt-10 sm:hidden">
          <Link to="/tim-xe" className="btn-outline">
            Xem tất cả xe
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Testimonials ──────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-500 to-brand-700" aria-label="Đánh giá khách hàng">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Khách hàng nói gì?</h2>
          <p className="mt-3 text-white/70">Hàng nghìn khách hàng hài lòng với dịch vụ của chúng tôi</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, rating, text }) => (
            <div key={name} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-4">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                  {name[0]}
                </div>
                <p className="font-medium text-white text-sm">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <FeaturedCarsSection />
      <TestimonialsSection />
    </>
  );
}
