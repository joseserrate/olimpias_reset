import React from 'react';
import { AppleButton, NeuralNetworkBackground } from '@/components/ui';

export const AppleHero: React.FC = () => {
  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-white">
      {/* Neural Network Animation */}
      <NeuralNetworkBackground />
      
      <div className="relative max-w-[1040px] mx-auto px-6 lg:px-8 z-10" style={{ width: '100%' }}>
        <div className="text-center flex flex-col justify-center min-h-screen py-20" style={{ margin: '0 auto', width: '100%' }}>
          {/* Main Headline */}
          <h1 className="text-[48px] sm:text-[56px] md:text-[72px] lg:text-[88px] font-semibold leading-[1.05] tracking-[-0.025em]">
            <span className="block">
              <span className="text-[#0B0B0D]">Centro de </span>
              <span className="relative inline-block opacity-95">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B3DF5] to-[#5B3DF5]">
                  IA Empresarial
                </span>
                {/* Subtle glow effect */}
                <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-[#5B3DF5] to-[#5B3DF5] blur-sm opacity-30">
                  IA Empresarial
                </span>
              </span>
            </span>
          </h1>
          
          {/* Spacer after headline - 12px (half) */}
          <div className="h-3"></div>
          
          {/* Subheadline */}
          <p 
            className="text-[21px] md:text-[24px] lg:text-[28px] max-w-[800px] leading-[1.45] font-normal text-[#1D1D1F]/80"
            style={{ 
              margin: '0 auto',
              textAlign: 'center',
              width: '100%'
            }}
          >
            Olimpias AI es el centro donde Bolivia diseña y gobierna agentes de inteligencia artificial para rendimiento empresarial.
          </p>
          
          {/* Spacer after subheadline - 24px (unchanged) */}
          <div className="h-6"></div>
          
          {/* CTA Buttons - Smaller 30% */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mx-auto">
            <button className="cursor-pointer h-[50px] px-10 text-[15px] font-semibold text-white bg-[#5B3DF5] rounded-md hover:bg-[#4A2FD5] transition-all duration-200 hover:shadow-md flex items-center gap-2 min-w-[180px] justify-center">
              Agendar Consulta
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <a 
              href="/casos" 
              className="h-[50px] px-10 text-[15px] font-semibold text-[#5B3DF5] bg-white border-2 border-[#E0E0E6] rounded-md hover:border-[#5B3DF5] transition-all duration-200 hover:shadow-md min-w-[180px] text-center flex items-center justify-center"
            >
              Explorar Casos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
