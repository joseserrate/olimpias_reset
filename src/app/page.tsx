import { AppleHero } from '@/components/sections/AppleHero';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <AppleHero />
      
      {/* Simple CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-3xl font-semibold text-[#0B0B0D] mb-4">
            Descubre Casos Reales de IA Empresarial
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Explora nuestra biblioteca de casos de uso donde la inteligencia artificial 
            transforma procesos empresariales en Bolivia.
          </p>
          <Link
            href="/casos"
            className="inline-flex items-center gap-2 h-[50px] px-10 text-[15px] font-semibold text-white bg-[#5B3DF5] rounded-md hover:bg-[#4A2FD5] transition-all duration-200 hover:shadow-md"
          >
            Explorar Biblioteca
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
