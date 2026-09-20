import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Booking from "@/components/Booking";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div data-testid="home-page" className="relative z-10 min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Booking />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
