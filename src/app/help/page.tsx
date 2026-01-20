'use client';

import { useState } from 'react';
import Link from "next/link";
import { HeadphonesIcon, Search, BookOpen, Video, MessageSquare, Zap, CheckCircle2, ChevronRight, FileText, Package, Users, Settings, CreditCard, AlertCircle } from "lucide-react";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: Package,
      title: "Getting Started",
      description: "Learn basics and set up your account",
      color: "from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
      articles: [
        { title: "How to create your shop", link: "#" },
        { title: "Adding your first product", link: "#" },
        { title: "Understanding the dashboard", link: "#" },
        { title: "Setting up your profile", link: "#" },
      ],
    },
    {
      icon: FileText,
      title: "Orders & Memos",
      description: "Manage orders and create professional memos",
      color: "from-purple-100 to-purple-200",
      iconColor: "text-purple-600",
      articles: [
        { title: "Creating a new order", link: "#" },
        { title: "Generating order memos", link: "#" },
        { title: "Order status management", link: "#" },
        { title: "Bulk order actions", link: "#" },
      ],
    },
    {
      icon: Users,
      title: "Customers",
      description: "Manage your customer database",
      color: "from-green-100 to-green-200",
      iconColor: "text-green-600",
      articles: [
        { title: "Adding customers manually", link: "#" },
        { title: "Customer order history", link: "#" },
        { title: "Customer communication", link: "#" },
        { title: "Exporting customer data", link: "#" },
      ],
    },
    {
      icon: Settings,
      title: "Settings & Configuration",
      description: "Customize your account and preferences",
      color: "from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
      articles: [
        { title: "Account settings", link: "#" },
        { title: "Shop customization", link: "#" },
        { title: "Notification preferences", link: "#" },
        { title: "Team management", link: "#" },
      ],
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description: "Manage subscriptions and payments",
      color: "from-red-100 to-red-200",
      iconColor: "text-red-600",
      articles: [
        { title: "Understanding pricing plans", link: "#" },
        { title: "Updating payment method", link: "#" },
        { title: "Invoice history", link: "#" },
        { title: "Canceling subscription", link: "#" },
      ],
    },
    {
      icon: AlertCircle,
      title: "Troubleshooting",
      description: "Solve common issues and problems",
      color: "from-yellow-100 to-yellow-200",
      iconColor: "text-yellow-600",
      articles: [
        { title: "Can't log in to account", link: "#" },
        { title: "Orders not syncing", link: "#" },
        { title: "Payment processing issues", link: "#" },
        { title: "Slow loading performance", link: "#" },
      ],
    },
  ];

  const popularArticles = [
    {
      title: "How to share your shop link on Facebook",
      views: "2.5K",
      category: "Getting Started",
    },
    {
      title: "Creating professional order memos in 3 steps",
      views: "1.8K",
      category: "Orders & Memos",
    },
    {
      title: "Managing inventory and stock levels",
      views: "1.5K",
      category: "Products",
    },
    {
      title: "Understanding order statuses",
      views: "1.2K",
      category: "Orders & Memos",
    },
    {
      title: "How to verify TrxID for orders",
      views: "1.1K",
      category: "Orders & Memos",
    },
    {
      title: "Setting up multiple payment methods",
      views: "980",
      category: "Settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6">
            <HeadphonesIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers, learn how to use EzyMemo, and get the most out of your account.
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg"
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className={`w-7 h-7 ${category.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <Link
                        href={article.link}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link"
                      >
                        <ChevronRight className="w-3 h-3" />
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  href="#"
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                        {article.category}
                      </span>
                      <span>•</span>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors mt-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Video Tutorials</h2>
              <p className="text-blue-100 mb-6">
                Watch step-by-step video guides to learn EzyMemo quickly.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Getting Started - Complete Guide", duration: "5:30" },
                  { title: "Creating Your First Order", duration: "3:45" },
                  { title: "Managing Products & Inventory", duration: "4:20" },
                ].map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-white/10 rounded-xl p-4 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{video.title}</h3>
                      <p className="text-sm text-blue-200">{video.duration}</p>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                View All Tutorials
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/contact"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                      Contact Support
                    </h3>
                    <p className="text-sm text-gray-600">Get personalized help</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <Zap className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                      Upgrade Your Plan
                    </h3>
                    <p className="text-sm text-gray-600">Unlock more features</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How do I create my first shop?",
                answer: "Creating your shop is easy! After signing up, click on 'Create Shop' in your dashboard. Fill in your shop details, add your products, and you're ready to go. The whole process takes less than 2 minutes.",
              },
              {
                question: "Can I use EzyMemo for free?",
                answer: "Yes! EzyMemo offers a free forever plan that includes all essential features. You can manage up to 50 products and 200 orders per month absolutely free. Upgrade to premium plans for higher limits and advanced features.",
              },
              {
                question: "How do I verify TrxID for orders?",
                answer: "When receiving payment through bank transfer or mobile banking, customers will provide a TrxID. Simply enter this TrxID in the order details, and our system will help you verify the transaction. You can also mark orders as verified manually.",
              },
              {
                question: "Is my data secure on EzyMemo?",
                answer: "Absolutely. We use bank-level encryption and security protocols to protect your data. Your information is stored securely in Bangladesh, and we never share or sell your data to third parties. Read our Privacy Policy for more details.",
              },
              {
                question: "Can I import my existing orders?",
                answer: "Yes! If you have orders from another platform, you can export them as a CSV file and import them into EzyMemo. Our system will automatically map fields and create your orders. Check our help articles for detailed instructions.",
              },
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Still Need Help?
              </h2>
              <p className="text-gray-600 mb-4">
                Our support team is here for you 24/7. Get personalized assistance with any questions or issues.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Contact Support
              </Link>
            </div>
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
