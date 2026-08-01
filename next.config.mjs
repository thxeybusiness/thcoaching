/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * Le programme détaillé était une page à part ; il occupe désormais le
   * chapitre « Programme » de l'accueil. L'ancienne adresse était en ligne et
   * référencée : on la redirige plutôt que de la laisser tomber en 404.
   */
  async redirects() {
    return [{ source: "/programme", destination: "/#offre", permanent: true }];
  },
};

export default nextConfig;
