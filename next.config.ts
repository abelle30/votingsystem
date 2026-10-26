import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '/api/assets/[name]': ['./image1.jpg', './image2.jpg', './image3.jpg', './image4.jpg', './image5.jpg', './img/ausglogo.jpg'],
  },
};

export default nextConfig;
