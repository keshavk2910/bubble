import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-br from-green-600 to-green-500">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-base font-bold font-sans leading-snug mb-4">
              Bubblebinz
            </h3>
            <p className="text-white text-base font-normal font-sans leading-normal">
              The premier marketplace for pressure washing and bin cleaning businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-normal font-sans leading-7 mb-6">
              Quick Links
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                  Browse Listings
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                  Post a Listing
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-lg font-normal font-sans leading-7 mb-6">
              Resources
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-lg font-normal font-sans leading-7 mb-6">
              Newsletter
            </h4>
            <p className="text-white text-base font-normal font-sans leading-normal mb-6">
              Stay updated with new listings and industry news.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-md text-neutral-500 text-base font-normal font-sans focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
              <button 
                type="submit"
                className="bg-neutral-900 text-white text-base font-normal font-sans px-4 py-2 rounded-r-md hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white text-base font-normal font-sans leading-normal">
              © 2025 Bubblebinz. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-8 justify-center md:justify-end">
              <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                Privacy Policy
              </a>
              <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                Terms of Service
              </a>
              <a href="#" className="text-white text-base font-normal font-sans leading-normal hover:underline transition-all">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}