import image1 from "@/app/assets/5116e4be081f83018c8edb2f7af47539cf88e4f0.png";
import image2 from "@/app/assets/9f13ecadcbced4d19bc15f999dd464355f2ad1a6.png";

export default function ShipmentPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative mt-20 md:mt-[135px] h-[300px] md:h-[570px] overflow-hidden">
        <img
          alt="Cargo ship aerial view"
          className="w-full h-full object-cover"
          src={image1.src}
        />
        <div className="absolute inset-0 bg-black/20" />
      </section>

      {/* Tracking Form Section */}
      <section className="relative -mt-16 md:-mt-[137px] pb-12 md:pb-24 z-10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="mx-auto w-full max-w-[1075px] bg-white rounded-xl md:rounded-[10px] shadow-2xl px-6 md:px-16 py-8 md:py-12 border border-emerald-50">
            <h2 className="font-['Inter'] font-semibold text-2xl md:text-[40px] text-[#296341] mb-8 md:mb-12 text-center leading-tight">
              Find and track your shipment
            </h2>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center">
              <input
                type="text"
                placeholder="Enter your invoice number"
                className="w-full md:flex-1 md:max-w-[571px] h-12 md:h-[52px] px-6 md:px-8 rounded-lg md:rounded-[10px] border-2 md:border-3 border-[#296341] font-['Inter'] font-medium text-lg md:text-[25px] text-[#626262] placeholder:text-[#626262]/50 focus:outline-none focus:ring-2 focus:ring-[#296341]"
              />
              <button className="w-full md:w-[244px] h-12 md:h-[52px] bg-[#296341] hover:bg-[#1e4d30] transition-colors text-white font-['Inter'] font-medium text-xl md:text-[30px] rounded-lg md:rounded-[10px] active:scale-95">
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Map/Image Section */}
      <section className="relative py-8 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="w-full max-w-[1360px] mx-auto">
            <div className="rounded-xl overflow-hidden shadow-xl border border-gray-100">
              <img
                alt="Shipment tracking map"
                className="w-full h-[300px] md:h-[668px] object-cover"
                src={image2.src}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
