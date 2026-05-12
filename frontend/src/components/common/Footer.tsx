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
    <footer className="bg-surface-900 text-slate-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="SkibidiCar">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Skibidi<span className="text-brand-500">Car</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Nền tảng cho thuê xe tự lái uy tín tại Việt Nam. Đa dạng xe, giá minh bạch, trải nghiệm tuyệt vời.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="tel:19001234" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-brand-400" />
                1900 1234
              </a>
              <a href="mailto:support@skibidicar.vn" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-brand-400" />
                support@skibidicar.vn
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
                123 Nguyễn Huệ, Q.1, TP.HCM
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4 text-sm">{title}</h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm hover:text-white transition-colors hover:translate-x-0.5 inline-block duration-200"
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
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-500/20 flex items-center justify-center transition-colors text-xs font-bold text-slate-400 hover:text-white"
              aria-label="Facebook"
            >
              FB
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-brand-500/20 flex items-center justify-center transition-colors"
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
