import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import AboutHome from "../../components/home/about-section";
import { HeroHome } from "../../components/home/hero-section";
import { PlansHome } from "../../components/home/plans-section";

export default function Home() {
  return (
    <div className="w-full">
      <Header />
      <main className="w-full mx-auto px-14 py-16">
        <HeroHome />
        <PlansHome />
        <AboutHome />
      </main>
      <Footer />
    </div>
  );
}
