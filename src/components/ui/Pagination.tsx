'use client';

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

interface Props {
    totalPages: number;
}

export default function Pagination({ totalPages }: Props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // Convertimos el valor (string | null) a número. Si es null o inválido, usamos 1.
    const currentPage = Number(searchParams?.get('page')) || 1;

    // Función para crear URLs manteniendo otros filtros (si existieran)
    const createPageUrl = (pageNumber: number | string) => {
        // Si searchParams es null, usamos un string vacío "" para evitar el error.
        const params = new URLSearchParams(searchParams ? searchParams.toString() : '');

        if (pageNumber === '...') return `${pathname}?${params.toString()}`;
        if (+pageNumber <= 0) return `${pathname}?${params.toString()}`;
        if (+pageNumber > totalPages) return `${pathname}?${params.toString()}`; // Evita pasarse
        // Seteamos la nueva página
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    return (
        <div className="flex justify-center mt-10 mb-20">
            <nav aria-label="Page navigation example">
                <ul className="flex list-style-none gap-2">

                    {/* Botón Anterior */}
                    <li className={`page-item ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Link
                            className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
                            href={createPageUrl(currentPage - 1)}>
                            Anterior
                        </Link>
                    </li>

                    {/* Números de Página */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className="page-item">
                            <Link
                                className={`page-link relative block py-1.5 px-3 border-0 outline-none transition-all duration-300 rounded focus:shadow-none
                  ${page === currentPage
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-transparent text-gray-800 hover:bg-gray-200'}`}
                                href={createPageUrl(page)}>
                                {page}
                            </Link>
                        </li>
                    ))}

                    {/* Botón Siguiente */}
                    <li className={`page-item ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Link
                            className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
                            href={createPageUrl(currentPage + 1)}>
                            Siguiente
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}