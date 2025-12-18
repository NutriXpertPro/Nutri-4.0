import {
  Instagram,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

const data = {
  products: [
    { text: 'Recursos', href: '#features' },
    { text: 'Planos', href: '#pricing' },
    { text: 'Depoimentos', href: '#testimonials' },
  ],
  support: [
    { text: 'Central de Ajuda', href: '#' },
    { text: 'Contato', href: '#' },
    { text: 'Status', href: '#' },
  ],
  legal: [
    { text: 'Termos de Uso', href: '#' },
    { text: 'Privacidade', href: '#' },
    { text: 'Cookies', href: '#' },
  ],
  contact: {
    email: 'contato@nutrixpertpro.com.br',
  },
  company: {
    name: 'Nutri Xpert Pro',
    description: 'A plataforma que transforma nutricionistas em referência. Atenda com excelência e construa sua autoridade no mercado.',
  },
};

export default function Footer4Col() {
  return (
    <footer className="border-t border-[#30363d] py-12 px-4 bg-[#0d1117] mt-16 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="text-white flex justify-center gap-2 sm:justify-start">
              <span className="text-2xl font-bold">
                {data.company.name}
              </span>
            </div>

            <p className="text-[#8b949e] mt-6 max-w-md text-center leading-relaxed sm:max-w-xs sm:text-left">
              {data.company.description}
            </p>

            <ul className="mt-8 flex justify-center gap-6 sm:justify-start md:gap-8">
              <li>
                <Link href="#" className="text-[#8b949e] hover:text-white transition">
                  <Instagram className="size-6" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[#8b949e] hover:text-white transition">
                  <Mail className="size-6" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-3">
            <div className="text-center sm:text-left">
              <p className="text-lg font-medium text-white">Produto</p>
              <ul className="mt-4 space-y-2 text-sm">
                {data.products.map(({ text, href }) => (
                  <li key={text}>
                    <a className="text-[#8b949e] hover:text-[#58a6ff] transition" href={href}>
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-lg font-medium text-white">Suporte</p>
              <ul className="mt-4 space-y-2 text-sm">
                {data.support.map(({ text, href }) => (
                  <li key={text}>
                    <a className="text-[#8b949e] hover:text-[#58a6ff] transition" href={href}>
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-lg font-medium text-white">Legal</p>
              <ul className="mt-4 space-y-2 text-sm">
                {data.legal.map(({ text, href }) => (
                  <li key={text}>
                    <a className="text-[#8b949e] hover:text-[#58a6ff] transition" href={href}>
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#30363d] pt-8">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <p className="text-sm text-[#8b949e]">
              <span className="block sm:inline">© 2024 {data.company.name}. Todos os direitos reservados.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
