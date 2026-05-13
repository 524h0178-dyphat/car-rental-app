import { Link } from 'react-router-dom';
import { Car, ExternalLink, Phone, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  'Dịch vụ': [
    { label: 'Thuê xe tự lái', to: '/tim-xe' },
    { label: 'Ký gửi xe', to: '/ky-gui-xe' },
    { label: 'Bảo hiểm xe', to: '#' },
  ],
  'Hỗ trợ': [
    { label: 'Hướng dẫn thuê xe', to: '#' },
    { label: 'Câu hỏi thường gặp', to: '#' },
    { label: 'Liên hệ', to: '#' },
  ],
  'Về SkibidiCar': [
    { label: 'Giới thiệu', to: '#' },
    { label: 'Chính sách bảo mật', to: '#' },
    { label: 'Điều khoản dịch vụ', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 pt-16 pb-8 border-t border-cyan-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-100 dark:border-slate-800">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="SkibidiCar">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-200">
                Skibidi<span className="text-brand-500">Car</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Nền tảng cho thuê xe tự lái uy tín tại Việt Nam. Đa dạng xe, giá minh bạch, trải nghiệm tuyệt vời.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="tel:19001234" className="flex items-center gap-2 hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
                <Phone className="w-4 h-4 text-brand-400" />
                1900 xxxx
              </a>
              <a href="mailto:support@skibidicar.vn" className="flex items-center gap-2 hover:text-brand-700 dark:hover:text-brand-400 transition-colors">
                <Mail className="w-4 h-4 text-brand-400" />
                skibidicarsystem@gmail.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                19 Nguyễn Hữu Thọ, Phường Tân Hưng, TP. Hồ Chí Minh
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-slate-900 dark:text-slate-200 font-semibold mb-4 text-sm">{title}</h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm hover:text-brand-700 dark:hover:text-brand-400 transition-colors hover:translate-x-0.5 inline-block duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} SkibidiCar. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-700 dark:hover:text-brand-400"
              aria-label="Facebook"
            >
              FB
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400 hover:text-brand-700 dark:hover:text-brand-400"
              aria-label="Youtube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
