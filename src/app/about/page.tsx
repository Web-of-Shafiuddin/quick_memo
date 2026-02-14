import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Target, Users, Zap, Globe, Award, TrendingUp, Lightbulb } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about EzyMemo's mission to empower social commerce sellers worldwide with free digital receipt generation and order management tools.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            About EzyMemo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering social commerce sellers worldwide with free digital receipts and the easiest order management platform
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                EzyMemo was born from a simple observation: social commerce sellers were struggling with managing orders scattered across multiple platforms. Lost messages, missed orders, and chaotic spreadsheets were the norm — whether in Dhaka, Lagos, or Los Angeles.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We asked ourselves: <em>Why can&apos;t there be a simple, powerful tool designed specifically for social commerce sellers?</em> A tool that brings all orders into one place, generates professional digital receipts, and helps businesses grow.
              </p>
              <p className="text-gray-600 leading-relaxed">
                So we built it. Today, EzyMemo serves thousands of sellers across the globe, helping them manage orders and grow their businesses efficiently. We&apos;re proud to be built in Bangladesh and used by entrepreneurs worldwide.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    2026
                  </div>
                  <div className="text-xl text-gray-700 font-semibold">Founded</div>
                  <div className="text-gray-600 mt-4">Dhaka, Bangladesh</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-4xl">🇧🇩</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed max-w-4xl">
              To simplify online selling for every social commerce entrepreneur worldwide by providing an intuitive, powerful, and free digital receipt and order management platform that handles invoicing, customer relationships, and growth — all in one place.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Stand For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Simplicity First",
                description: "We believe powerful tools should be easy to use. No complex setup, no learning curve.",
                color: "from-yellow-100 to-orange-100",
                iconColor: "text-yellow-600",
              },
              {
                icon: Users,
                title: "Customer Success",
                description: "Your success is our success. We're committed to helping you grow your business.",
                color: "from-blue-100 to-cyan-100",
                iconColor: "text-blue-600",
              },
              {
                icon: Globe,
                title: "Global Reach, Local Heart",
                description: "Built by Bangladeshi engineers, used by sellers worldwide. We understand the needs of social commerce.",
                color: "from-green-100 to-emerald-100",
                iconColor: "text-green-600",
              },
              {
                icon: Award,
                title: "Trust & Security",
                description: "Your data is safe with us. We implement bank-level security for your peace of mind.",
                color: "from-purple-100 to-pink-100",
                iconColor: "text-purple-600",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4`}>
                  <value.icon className={`w-7 h-7 ${value.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Our Impact</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "100+", label: "Active Sellers" },
                { value: "10K+", label: "Orders Managed" },
                { value: "98%", label: "Satisfaction Rate" },
                { value: "24/7", label: "Support Available" },
              ].map((stat, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why Sellers Love Us</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Get started in just 2 minutes",
                "No credit card required for free plan",
                "Professional memos in one click",
                "Track orders from Facebook, Instagram, and WhatsApp",
                "Build customer relationships easily",
                "Grow your sales with insights",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Join Our Growing Community</h2>
          <p className="text-xl text-blue-100 text-center mb-8 max-w-3xl mx-auto">
            Be part of thousands of social commerce sellers who have transformed their business with EzyMemo. Start creating digital receipts and managing your orders effortlessly today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Get Started Free
              <TrendingUp className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                question: "Is EzyMemo really free?",
                answer: "Yes! Our free plan includes all essential features to get started. You can upgrade to premium plans for additional features and higher limits.",
              },
              {
                question: "Do I need technical skills to use EzyMemo?",
                answer: "Not at all. EzyMemo is designed to be intuitive and easy to use. If you can use Facebook, you can use EzyMemo.",
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use bank-level encryption and security measures to protect your data. We never share or sell your information.",
              },
              {
                question: "Can I use EzyMemo on mobile?",
                answer: "Yes! EzyMemo is fully responsive and works perfectly on any device - desktop, tablet, or mobile phone.",
              },
            ].map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
