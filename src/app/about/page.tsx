export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-5xl font-normal text-[#202124]">About Sewago</h1>
        <p className="text-lg text-[#6B6B6B]">Learn more about our mission and values.</p>
      </div>

      <div className="flex gap-5">
        <div className="flex w-[400px] flex-col rounded-[24px] bg-white p-6 shadow-sm">
          <span className="text-sm font-medium text-[#9A9A9A]">Our Mission</span>
          <p className="mt-3 text-[#202124]">
            Sewago is dedicated to connecting people with quality services, making everyday tasks easier and more accessible for everyone.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 rounded-[24px] bg-gradient-to-br from-[#B8F25E] to-[#4CAF50] p-6 shadow-sm">
              <span className="text-sm font-medium text-[#202124]">Founded</span>
              <p className="mt-2 text-[32px] font-semibold text-[#202124]">2024</p>
            </div>
            <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm">
              <span className="text-sm font-medium text-[#9A9A9A]">Team Size</span>
              <p className="mt-2 text-[32px] font-semibold text-[#202124]">50+</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm">
              <span className="text-sm font-medium text-[#9A9A9A]">Happy Customers</span>
              <p className="mt-2 text-[32px] font-semibold text-[#202124]">10K+</p>
            </div>
            <div className="flex-1 rounded-[24px] bg-white p-6 shadow-sm">
              <span className="text-sm font-medium text-[#9A9A9A]">Services Offered</span>
              <p className="mt-2 text-[32px] font-semibold text-[#202124]">100+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
