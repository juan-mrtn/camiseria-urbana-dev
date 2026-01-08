export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold mb-4">La Camisería Urbana</h3>
          <p className="text-sm text-gray-600">Camisas de calidad premium. Envíos a todo el país. Atención personalizada.</p>
          <p className="text-sm text-indigo-600 mt-2">soporte@camiseria.com</p>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Información</h4>
          <ul className="text-sm space-y-2 text-gray-600">
            <li><a href="#" className="hover:underline">Términos y condiciones</a></li>
            <li><a href="#" className="hover:underline">Política de privacidad</a></li>
            <li><a href="#" className="hover:underline">Cambios y devoluciones</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Redes Sociales</h4>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="#" className="hover:text-indigo-600">Instagram</a>
            <a href="#" className="hover:text-indigo-600">Facebook</a>
            <a href="#" className="hover:text-indigo-600">Twitter (X)</a>
          </div>
        </div>
      </div>
    </footer>
  );
}