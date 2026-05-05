import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Car, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { formatPrice } from '@/utils/formatters';

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price_per_day: number;
  image?: string;
}

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface Props {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchAutocomplete({ placeholder = 'Tìm xe theo tên, hãng...', className = '', autoFocus }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const listRef   = useRef<HTMLUListElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const debounced = useDebouncedValue(query, 300);

  const { data, isFetching } = useQuery({
    queryKey: ['autocomplete', debounced],
    queryFn: async () => {
      const res = await api.get<{ data: Suggestion[] }>('/cars', {
        params: { search: debounced, per_page: 6 },
      });
      return res.data.data;
    },
    enabled: debounced.trim().length >= 2,
    staleTime: 30_000,
  });

  const suggestions = data ?? [];

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openWhenReady = useCallback(() => {
    if (debounced.trim().length >= 2) setIsOpen(true);
  }, [debounced]);

  useEffect(() => {
    openWhenReady();
  }, [suggestions, openWhenReady]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0) {
        navigate(`/xe/${suggestions[activeIdx].slug}`);
        setIsOpen(false);
        setQuery('');
      } else {
        navigate(`/tim-xe?search=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIdx(-1);
    }
  }

  function handleSelect(slug: string) {
    navigate(`/xe/${slug}`);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  }

  function handleSearchAll() {
    if (query.trim()) {
      navigate(`/tim-xe?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  }

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="autocomplete-list"
          aria-activedescendant={activeIdx >= 0 ? `ac-item-${activeIdx}` : undefined}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); }}
          onFocus={() => { if (debounced.trim().length >= 2) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field pl-10 pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isFetching && <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />}
          {query && !isFetching && (
            <button
              onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul
          id="autocomplete-list"
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-up"
        >
          {suggestions.length === 0 && !isFetching && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">
              Không tìm thấy xe phù hợp
            </li>
          )}

          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`ac-item-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => handleSelect(s.slug)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                i === activeIdx
                  ? 'bg-brand-50 dark:bg-brand-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {s.image ? (
                <img src={s.image} alt={s.name}
                  className="w-12 h-8 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-12 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                <p className="text-xs text-slate-400">{s.brand}</p>
              </div>
              <span className="text-xs font-semibold text-brand-500 flex-shrink-0">
                {formatPrice(s.price_per_day)}/ngày
              </span>
            </li>
          ))}

          {/* View all results */}
          {suggestions.length > 0 && (
            <li
              onClick={handleSearchAll}
              className="px-4 py-3 text-center text-sm text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 cursor-pointer font-medium border-t border-slate-100 dark:border-slate-700 transition-colors"
            >
              Xem tất cả kết quả cho "{query}" →
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
