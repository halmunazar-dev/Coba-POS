import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Plus, AlertCircle, ScanBarcode } from 'lucide-react';
import { Product } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { posSound } from '../utils/sound';

interface MenuCatalogViewProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const MenuCatalogView: React.FC<MenuCatalogViewProps> = ({
  products,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const cats = ['All'];
    products.forEach((p) => {
      if (!cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery)) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) return;
    posSound.playBeep();
    onAddToCart(product);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#11131f] overflow-hidden no-print">
      
      {/* Category Tabs & Search Bar Header */}
      <div className="p-4 md:px-6 border-b border-slate-800/80 bg-[#161826]/70 backdrop-blur-sm space-y-3 shrink-0">
        
        {/* Horizontal Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  posSound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input matching reference screenshot */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Something (Nama menu atau scan barcode)..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#1a1d2e] border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs md:text-sm focus:outline-none focus:border-amber-400/80 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Product Grid Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
            <Search className="w-10 h-10 mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">Menu tidak ditemukan</p>
            <p className="text-xs text-slate-500 mt-1">Coba kata kunci lain atau pilih kategori Semua</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-4.5">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className={`group relative bg-[#1a1d2e] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-400/5 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'
                  }`}
                >
                  {/* Food Image with Fallback */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback image gradient
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    
                    {/* Stock indicator badge */}
                    <div className="absolute top-2 right-2">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-bold">
                          Habis
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-bold">
                          Sisa {product.stock}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-slate-300 text-[10px] font-medium">
                          Stok: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details matching reference */}
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      {/* Price Tag in bold amber */}
                      <div className="text-amber-400 font-extrabold text-sm md:text-base font-mono mb-0.5">
                        {formatRupiah(product.price)}
                      </div>
                      
                      {/* Product Name */}
                      <h3 className="text-slate-100 font-bold text-xs md:text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Quick Add Button bottom strip */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-slate-400 group-hover:text-slate-200">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        {product.category}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-all">
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
