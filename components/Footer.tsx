import svgPaths from '@/app/imports/svg-1kz55w3e74';
import imgRectangle4 from "@/app/assets/3ffc24d8b6b2a7f5ec77f9c65134af63bb12a59d.png";
import imgEllipse10 from "@/app/assets/bf9cd628ad5f00dd322c5f93f026d17b58691ba9.png";
import imgEllipse11 from "@/app/assets/346182195ff46a2a07dc2451f19eb7228d7596a1.png";
import imgRectangle44 from "@/app/assets/0630bc807bbd9122cb449e66c33d18d13536d121.png";
import imgRectangle56 from "@/app/assets/c65da6ab6f4bda8a2bd7648a2be4287c1ac755df.png";
import imgRectangle1 from "@/app/assets/ffb62b7af25544291ca34f641dc70191ad198db6.png";
import SchedulePage from '@/components/SchedulePage';

export default function Footer() {
  return (
    <footer className="bg-[#5f8a71] text-white py-10 md:py-16 px-4 md:px-8">
      <div className="max-w-[1440px] mx-auto">
        {/* Logo */}
        <div className="mb-8 md:mb-12 flex justify-center md:justify-start">
          <img
            alt="Dean's Shipping Ltd."
            className="h-[60px] md:h-[86px] w-auto object-cover"
            src={imgRectangle44.src}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-12 mb-12">
          {/* Head Office */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-semibold mb-6">Head office</h3>

            <div className="space-y-6 text-lg md:text-xl">
              <div>
                <p className="text-xl md:text-[22px] font-semibold mb-2">Nassau, The Bahamas</p>
                <p className="font-normal">Parkgate Road</p>
                <p className="font-normal">P.O. Box EE-17318</p>
                <p className="font-normal mt-2">CALL: 1.242.394.0245/6</p>
              </div>

              <div>
                <p className="text-xl md:text-[22px] font-semibold mb-2">Potter's Cay</p>
                <p className="font-normal">CALL: 1.242.601.5121</p>
              </div>

              <div>
                <p className="text-xl md:text-[22px] font-semibold mb-2">Abaco, The Bahamas</p>
                <p className="font-normal">Queen's Highway (at Port)</p>
                <p className="font-normal">CALL: 1.242.367.2389</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-lg md:text-xl font-medium">
              <li><a href="#about" className="hover:underline transition-all">About Us</a></li>
              <li><a href="#book" className="hover:underline transition-all">Book now</a></li>
              <li><a href="#contact" className="hover:underline transition-all">Contact us</a></li>
              {/* <li><a href="#terms" className="hover:underline transition-all">Terms & Condition</a></li>
              <li><a href="#privacy" className="hover:underline transition-all">Privacy Policy</a></li> */}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="text-center md:text-left col-span-1 sm:col-span-2 md:col-span-1">
            <h3 className="text-2xl font-semibold mb-6">Contact Us</h3>

            <div className="space-y-4 flex flex-col items-center md:items-start text-lg md:text-xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p995f500} fill="white" />
                </svg>
                <a href="mailto:contact@contact.com" className="font-light hover:underline">
                  contact@contact.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <path d={svgPaths.pe263670} fill="white" />
                  <path d={svgPaths.p5e7740} fill="white" />
                </svg>
                <span className="font-light">+1 98765 43210</span>
              </div>
            </div>

            <div className="mt-10 md:mt-8">
              <p className="text-2xl font-medium mb-4">Follow us on</p>
              <div className="flex items-center justify-center md:justify-start gap-6 md:gap-4">
                <a href="https://www.instagram.com/deansshippingbahamas" className="hover:scale-110 transition-transform" aria-label="Instagram">
                  <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p24edac00} fill="url(#paint0_radial_footer)" />
                    <path d={svgPaths.p24edac00} fill="url(#paint1_radial_footer)" />
                    <path d={svgPaths.p3f139100} fill="white" />
                    <defs>
                      <radialGradient cx="0" cy="0" gradientTransform="translate(6.375 25.8485) rotate(-90) scale(23.7858 22.1227)" gradientUnits="userSpaceOnUse" id="paint0_radial_footer" r="1">
                        <stop stopColor="#FFDD55" />
                        <stop offset="0.1" stopColor="#FFDD55" />
                        <stop offset="0.5" stopColor="#FF543E" />
                        <stop offset="1" stopColor="#C837AB" />
                      </radialGradient>
                      <radialGradient cx="0" cy="0" gradientTransform="translate(-4.02009 1.72884) rotate(78.681) scale(10.6324 43.827)" gradientUnits="userSpaceOnUse" id="paint1_radial_footer" r="1">
                        <stop stopColor="#3771C8" />
                        <stop offset="0.128" stopColor="#3771C8" />
                        <stop offset="1" stopColor="#6600FF" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                  </svg>
                </a>

                <a href="https://www.facebook.com/deansshipping242" className="hover:scale-110 transition-transform" aria-label="Facebook">
                  <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p1fdd2200} fill="#1877F2" />
                    <path d={svgPaths.p23faaa00} fill="white" />
                  </svg>
                </a>

                {/* <a href="#linkedin" className="hover:scale-110 transition-transform" aria-label="LinkedIn">
                  <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p24edac00} fill="#0A66C2" />
                    <path d={svgPaths.pf9a8e00} fill="white" />
                  </svg>
                </a> */}

                {/* <a href="#twitter" className="hover:scale-110 transition-transform" aria-label="Twitter">
                  <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24">
                    <rect fill="white" height="16" width="18" x="3" y="4" />
                    <path clipRule="evenodd" d={svgPaths.p2a062900} fill="#5F8A71" fillRule="evenodd" />
                  </svg>
                </a> */}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/30 pt-8 text-center text-base md:text-xl">
          <p className="font-medium">Dean&apos;s Shipping Ltd. &copy; 2025. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
