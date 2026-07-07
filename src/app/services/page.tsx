export default function ServicesPage() {
  const services = [
    { title: "Home Cleaning", description: "Professional home cleaning services at your convenience.", icon: "🏠" },
    { title: "Plumbing", description: "Expert plumbing solutions for all your needs.", icon: "🔧" },
    { title: "Electrical", description: "Safe and reliable electrical services.", icon: "⚡" },
    { title: "Painting", description: "Transform your space with quality painting.", icon: "🎨" },
    { title: "Gardening", description: "Keep your garden beautiful and maintained.", icon: "🌿" },
    { title: "Moving", description: "Hassle-free moving and packing services.", icon: "📦" },
  ];

  return (
    <div className="flex flex-col gap-6 p-2" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div>
        <h1 className="text-5xl font-normal text-[#202124]">Our Services</h1>
        <p className="text-lg text-[#6B6B6B]">Discover the wide range of services we offer.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {services.map((service) => (
          <div key={service.title} className="flex flex-col rounded-[24px] bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
              {service.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#202124]">{service.title}</h3>
            <p className="mt-2 text-base text-[#6B6B6B]">{service.description}</p>
            <button className="mt-4 self-start rounded-full bg-[#B8F25E] px-5 py-2 text-base font-semibold text-[#202124] ">
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
