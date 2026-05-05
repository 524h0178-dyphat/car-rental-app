import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SITE_NAME = 'BonBonCar';
const DEFAULT_DESC = 'Thuê xe tự lái uy tín tại Việt Nam. Hàng trăm mẫu xe, giá minh bạch, đặt xe nhanh chóng.';
const BASE_URL = 'https://bonboncar.vn';

export default function SEO({ title, description, image, url }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Thuê xe tự lái uy tín`;
  const desc = description ?? DEFAULT_DESC;
  const ogUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const ogImage = image ?? `${BASE_URL}/og-image.jpg`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:url"         content={ogUrl} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="vi_VN" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={ogImage} />

      {/* Canonical */}
      <link rel="canonical" href={ogUrl} />
    </Helmet>
  );
}
