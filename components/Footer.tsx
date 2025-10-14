export default function Footer() {
  return (
    <footer aria-label="Pie de página" className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <nav aria-label="Contacto y legales" className="flex flex-wrap gap-4 justify-center items-center">
          <a href="#contacto" className="hover:text-emerald-400 transition-colors">Contacto</a>
          <span className="text-gray-500">·</span>
          <a href="#legales" className="hover:text-emerald-400 transition-colors">Legales</a>
        </nav>
        <p className="text-center text-gray-400 text-sm mt-4">© 2025 Green Fashion Score by Ecodicta</p>
      </div>
    </footer>
  );
}


