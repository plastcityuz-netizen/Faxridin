import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Advantages } from "@/components/Advantages";
import { Products } from "@/components/Products";
import { Stats } from "@/components/Stats";
import { Production } from "@/components/Production";
import { About } from "@/components/About";
import { Applications } from "@/components/Applications";
import { Partners } from "@/components/Partners";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { OrderProvider } from "@/components/OrderProvider";
import { ScrollEffects } from "@/components/ScrollEffects";

export default function Home() {
  return (
    <OrderProvider>
      <a className="skip-link" href="#main-content">Asosiy mazmunga o‘tish</a>
      <Navbar />
      <main id="main-content"><Hero /><Advantages /><Products /><Stats /><Production /><About /><Applications /><Partners /><Contact /></main>
      <Footer />
      <ScrollEffects />
    </OrderProvider>
  );
}
