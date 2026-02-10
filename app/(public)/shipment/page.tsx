import image1 from "@/app/assets/5116e4be081f83018c8edb2f7af47539cf88e4f0.png";
import image2 from "@/app/assets/9f13ecadcbced4d19bc15f999dd464355f2ad1a6.png";

export default function ShipmentPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative mt-[135px] h-[570px] overflow-hidden">
        <img
          alt="Cargo ship aerial view"
          className="w-full h-full object-cover"
          src={image1.src}
        />
      </section>

      {/* Tracking Form Section */}
      <section className="relative -mt-[137px] pb-24">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="mx-auto w-[1075px] bg-white rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] px-16 py-12">
            <h2 className="font-['Inter'] font-semibold text-[40px] text-[#296341] mb-12 text-center">
              Find and track your shipment
            </h2>
            <div className="flex gap-8 items-center justify-center">
              <input
                type="text"
                placeholder="Enter your invoice number"
                className="flex-1 max-w-[571px] h-[52px] px-8 rounded-[10px] border-3 border-[#296341] font-['Inter'] font-medium text-[25px] text-[#626262] placeholder:text-[#626262] focus:outline-none focus:ring-2 focus:ring-[#296341] focus:ring-offset-2"
              />
              <button className="w-[244px] h-[52px] bg-[#296341] hover:bg-[#1e4d30] transition-colors text-white font-['Inter'] font-medium text-[30px] rounded-[10px] border-3 border-[#296341]">
                Submit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Map/Image Section */}
      <section className="relative py-16">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="w-full max-w-[1360px] mx-auto">
            <img
              alt="Shipment tracking map"
              className="w-full h-[668px] object-cover rounded-lg"
              src={image2.src}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
