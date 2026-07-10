"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Calendar,
  Heart,
  BookOpen,
  Trash2,
  Utensils,
  Recycle,
  Handshake,
} from "lucide-react";

const services = [
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Exchange, giveaway, or request items from your community.",
    href: "/dashboard/marketplace",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Join cleaning campaigns, plantation drives, workshops, and community meetups.",
    href: "/dashboard/events",
  },
  {
    icon: Heart,
    title: "Donations",
    description: "Support verified NGOs working on climate and social causes with secure donations.",
    href: "/donate",
  },
  {
    icon: BookOpen,
    title: "Education",
    description: "Learn about climate change, sustainability, waste management, and social impact.",
    href: "/about",
  },
  {
    icon: Trash2,
    title: "Waste Management",
    description: "Learn proper waste disposal and support recycling initiatives in your area.",
    href: "/about",
  },
  {
    icon: Utensils,
    title: "Food Sharing",
    description: "Help fight hunger by sharing food with those in need.",
    href: "/about",
  },
  {
    icon: Recycle,
    title: "Sustainability",
    description: "Track your environmental impact — items reused, CO2 saved, waste diverted.",
    href: "/dashboard",
  },
  {
    icon: Handshake,
    title: "Community",
    description: "Connect with neighbors, build reputation, and strengthen local bonds.",
    href: "/dashboard/messages",
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Services</h1>
        <p className="text-base text-text-secondary mt-1">Everything you need to make a difference in your community.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="group flex flex-col rounded-2xl bg-surface p-5 shadow-sm border border-border-light hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-default mb-4">
              <s.icon size={20} className="text-text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-semibold text-text-primary">{s.title}</h3>
            <p className="mt-1.5 text-sm text-text-secondary leading-relaxed flex-1">{s.description}</p>
            <span className="mt-4 text-xs font-medium text-accent group-hover:underline">Learn More →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
