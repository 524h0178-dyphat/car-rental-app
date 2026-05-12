import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const BASE_URL = 'https://skibidicar.vn';

export default function JsonLdBreadcrumb({ items }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// ── Vehicle schema for car detail page ───────────────────────────────────────
interface VehicleSchemaProps {
  name: string;
  brand: string;
  price: number;
  seats: number;
  image?: string;
  url: string;
  description?: string;
}

export function JsonLdVehicle({ name, brand, price, seats, image, url, description }: VehicleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name,
    brand: { '@type': 'Brand', name: brand },
    description,
    image,
    url: `${BASE_URL}${url}`,
    numberOfDoors: seats,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'VND',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

// ── Organization schema (global, in Layout) ───────────────────────────────────
export function JsonLdOrganization() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SkibidiCar',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+84-1900-1234',
      contactType: 'customer service',
      availableLanguage: 'Vietnamese',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Nguyễn Huệ',
      addressLocality: 'Quận 1',
      addressRegion: 'TP. Hồ Chí Minh',
      addressCountry: 'VN',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
