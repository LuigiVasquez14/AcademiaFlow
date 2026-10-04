import React from 'react';
import { BookOpen, CheckCircle2, Users, BarChart3 } from 'lucide-react';

interface AuthBannerProps {
  titulo?: string;
  subtitulo?: string;
}

const FEATURES = [
  { icono: <BarChart3 size={15} />, texto: 'Gestión de proyectos académicos' },
  { icono: <CheckCircle2 size={15} />, texto: 'Control de tareas y verificaciones' },
  { icono: <Users size={15} />, texto: 'Colaboración entre equipos' },
  { icono: <BookOpen size={15} />, texto: 'Seguimiento de avances en tiempo real' },
];

export const AuthBanner: React.FC<AuthBannerProps> = ({
  titulo = 'Hola,\n¡Bienvenido!',
  subtitulo = 'Gestiona proyectos, controla tareas y colabora con tu equipo académico desde un solo lugar.',
}) => {
  return (
    <div className="w-full md:w-5/12 bg-gradient-to-br from-[#0D1523] via-[#131D30] to-[#1B2D50] p-8 md:p-10 text-[#F9FAFB] flex flex-col justify-between relative min-h-[420px] md:min-h-[560px] overflow-hidden">

      {/* Círculos decorativos */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#465FFF]/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#465FFF]/8 blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg">
          <div className="w-5 h-5 rounded bg-[#465FFF] flex items-center justify-center text-white font-bold text-[10px]">AF</div>
          <span className="text-xs font-bold tracking-wider text-[#F9FAFB]">AcademiaFlow</span>
        </div>
      </div>

      {/* Mensaje central */}
      <div className="relative z-10 my-auto py-8">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-4 text-[#F9FAFB] whitespace-pre-line">
          {titulo}
        </h2>
        <p className="text-[#98A2B3] text-sm leading-relaxed max-w-sm mb-8">
          {subtitulo}
        </p>

        {/* Features */}
        <ul className="space-y-2.5">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[13px] text-[#CBD5E0]">
              <span className="text-[#465FFF]">{f.icono}</span>
              {f.texto}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-xs text-[#4A5568] tracking-wider">
        © 2026 ACADEMIA FLOW · SISTEMA DE GESTIÓN ACADÉMICA
      </div>
    </div>
  );
};
