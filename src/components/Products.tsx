import { Info } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function Products() {
  return (
    <section id="products" className="section products-section" aria-labelledby="products-title">
      <div className="container">
        <div className="section-heading section-heading--products">
          <div><p className="eyebrow"><span />MAHSULOTLAR</p><h2 id="products-title">Uch mahsulot.<br /><span className="text-muted">Aniq tanlov.</span></h2></div>
          <div className="section-heading__aside"><p>Vazifangizga mos penaplastni tanlang.<br />Zichlik, qalinlik va miqdorni belgilang —<br className="desktop-break" /> narxni darhol ko‘ring.</p><span className="catalog-note"><span className="status-dot status-dot--orange" />3 ta mahsulot · USD narxlar</span></div>
        </div>
        <div className="products-grid">{PRODUCTS.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        <div className="products-footnote"><Info size={16} aria-hidden="true" /><p>Plitalar narxi <strong>1 m³</strong> uchun, maydalangan penaplast narxi <strong>1 kg</strong> uchun. Qalinlik plita spetsifikatsiyasini belgilaydi; hajm narxi o‘zgarmaydi. Yakuniy narx va yetkazib berish operator bilan tasdiqlanadi.</p></div>
      </div>
    </section>
  );
}
