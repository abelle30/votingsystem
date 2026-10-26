import { Shell } from '@/components/ui';
import Image from 'next/image';

export default function Home() {
  return <Shell>
    <main className="shell">
      <section className="hero">
        <h1>Adamson University Student Government</h1>
      </section>
      <Image className="legacy-logo" src="/api/assets/ausglogo.jpg" alt="Adamson University Student Government logo" width={600} height={600} unoptimized />
      <div className="legacy-copy">
        <h2>The Adamson University Student Government (AUSG) was established on October 11. 1981 after a three stage election that started the basic political unit in the University.</h2>
      </div>
      <div className="legacy-slider" aria-label="Adamson University image slideshow">
        <div className="legacy-slider-track">
          {['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg'].map((image) => <Image key={image} src={`/api/assets/${image}`} alt="Adamson University" width={1200} height={500} unoptimized />)}
        </div>
      </div>
    </main>
  </Shell>;
}
