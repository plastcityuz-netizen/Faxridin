import { ArrowDownRight, Info } from "lucide-react";
import { DENSITY_OPTIONS, GRANULE_PRICE_CENTS, PRODUCTS, formatMoney } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function Products() {
  return (
    <section id="products" className="section products-section" aria-labelledby="products-title">
      <div className="container">
        <div className="section-heading section-heading--products" data-reveal>
          <div><p className="eyebrow"><span /> MAHSULOTLAR <b> / 02</b></p><h2 id="products-title">Har bir vazifaga<br /><span className="text-muted">mos yechim.</span></h2></div>
          <div className="section-heading__aside"><p>Zichlik, qalinlik va miqdorni tanlang. Kerakli mahsulot narxini shu yerning o‘zida hisoblang.</p><span className="catalog-note"><span className="status-dot status-dot--orange" /> KATALOG / 3 TA MAHSULOT</span></div>
        </div>
        <div id="prices" className="price-intro" data-reveal>
          <div><span className="price-intro__label">NARXLAR</span><strong>Ochiq va tushunarli hisob.</strong></div>
          <p>Plitalar <b>{formatMoney(DENSITY_OPTIONS[0].priceCents)} / m³</b> dan <span>·</span> Granula <b>{formatMoney(GRANULE_PRICE_CENTS)} / kg</b></p>
          <ArrowDownRight size={20} aria-hidden="true" />
        </div>
        <div className="products-grid">{PRODUCTS.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        <div className="products-footnote"><Info size={17} aria-hidden="true" /><p>Plitalar narxi <strong>1 m³</strong> uchun, maydalangan penaplast narxi <strong>1 kg</strong> uchun. Qalinlik plita spetsifikatsiyasini belgilaydi; hajm narxi o‘zgarmaydi. Yakuniy narx va yetkazib berish operator bilan tasdiqlanadi.</p></div>
      </div>
    </section>
  );
}
