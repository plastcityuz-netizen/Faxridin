import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Products } from "@/components/Products";
import { Production } from "@/components/Production";
import { Advantages } from "@/components/Advantages";
import { Applications } from "@/components/Applications";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { OrderProvider } from "@/components/OrderProvider";

export default function Home() {
  return (
    <OrderProvider>
      <a className="skip-link" href="#main-content">Asosiy mazmunga o‘tish</a>
      <Navbar />
      <main id="main-content"><Hero /><Products /><Production /><Advantages /><Applications /><About /><Contact /></main>
      <Footer />
    </OrderProvider>
  );
}
