import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-ng flex flex-col items-center py-24 text-center">
      <p className="text-5xl font-extrabold text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">Página no encontrada</h1>
      <p className="mt-2 text-ink-500">La página que buscas no existe o se ha movido.</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-accent-500 px-6 py-3 font-semibold text-white hover:bg-accent-600"
      >
        Volver al inicio
      </Link>
    </section>
  );
}
