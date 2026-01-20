import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle, AlertTriangle, Users, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for EzyMemo - Your agreement for using our sales management platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Effective Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> By accessing or using EzyMemo, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our platform.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using EzyMemo ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service. These terms apply to all visitors, users, and others who access or use the Platform.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">2. Use License</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials on EzyMemo for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the Platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">3. User Responsibilities</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">As a user of EzyMemo, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account and password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Use the Platform for lawful purposes only</li>
              <li>Not upload or transmit viruses, malware, or harmful code</li>
              <li>Not interfere with or disrupt the Platform or servers</li>
              <li>Not attempt to gain unauthorized access to any part of the Platform</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">4. Account Registration and Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              To use certain features of the Platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Provide accurate and complete information during registration</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept full responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access or use</li>
              <li>Not share your account credentials with others</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We reserve the right to suspend or terminate your account at any time for violation of these terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Activities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Using the Platform for any illegal purpose</li>
              <li>Selling counterfeit, stolen, or unauthorized goods</li>
              <li>Misrepresenting your identity or affiliation</li>
              <li>Engaging in fraudulent activities or scams</li>
              <li>Violating any applicable laws or regulations in Bangladesh</li>
              <li>Uploading content that infringes on intellectual property rights</li>
              <li>Collecting or harvesting user data without permission</li>
              <li>Interfering with other users' use of the Platform</li>
              <li>Engaging in spam or unsolicited communications</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Content and Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              All content on the Platform, including text, graphics, logos, images, and software, is the property of EzyMemo or its content suppliers and is protected by Bangladesh and international copyright laws.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              You retain ownership of any content you upload to the Platform. However, you grant EzyMemo a non-exclusive, worldwide, royalty-free license to use, reproduce, display, and distribute your content for the purpose of providing our services.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You represent and warrant that you have the right to grant this license and that your content does not infringe on any third-party rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Certain services may require payment. By subscribing to a paid plan, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Pay all applicable fees and charges</li>
              <li>Provide accurate payment information</li>
              <li>Authorize automatic recurring payments for subscription plans</li>
              <li>Understand that fees are non-refundable except as required by law</li>
              <li>Notify us of any billing disputes within 30 days of the charge</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We reserve the right to modify our pricing at any time with prior notice to subscribers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability and Modifications</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We strive to maintain the Platform's availability but do not guarantee uninterrupted access. We reserve the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Modify, suspend, or discontinue any aspect of the Platform</li>
              <li>Impose limits on certain features or services</li>
              <li>Restrict access to parts of the Platform</li>
              <li>Update or change the Platform without notice</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We are not liable for any loss or damage resulting from service interruptions or modifications.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">9. Disclaimer of Warranties</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Platform is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Non-infringement of third-party rights</li>
              <li>Accuracy or reliability of information</li>
              <li>Availability or security of the Platform</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To the fullest extent permitted by law, EzyMemo shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, business, or goodwill</li>
              <li>Damages arising from use or inability to use the Platform</li>
              <li>Damages from unauthorized access to your account</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Our total liability shall not exceed the amount paid by you, if any, for accessing the Platform in the twelve months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold harmless EzyMemo, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Platform, violation of these terms, or infringement of any third-party rights.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              Your use of the Platform is also governed by our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. Please review our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Platform at our sole discretion, without prior notice, for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Violation of these Terms of Service</li>
              <li>Illegal or fraudulent activities</li>
              <li>Extended periods of inactivity</li>
              <li>Failure to pay applicable fees</li>
              <li>Any other reason we deem appropriate</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Upon termination, all rights granted to you will immediately cease. You may also terminate your account at any time by contacting us.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law and Dispute Resolution</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              These Terms of Service shall be governed by and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Any disputes arising from or relating to these terms or the Platform shall be resolved through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Good faith negotiations between the parties</li>
              <li>Mediation in Dhaka, Bangladesh</li>
              <li>If necessary, binding arbitration in Dhaka, Bangladesh</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Modifications to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify you of material changes by posting the updated terms on the Platform and updating the "Last updated" date. Your continued use of the Platform after such changes constitutes your acceptance of the modified terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Severability</h2>
            <p className="text-gray-600 leading-relaxed">
              If any provision of these Terms of Service is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity and enforceability of any remaining provisions.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Entire Agreement</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and EzyMemo regarding your use of the Platform and supersede all prior agreements and understandings.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-600">
                <strong>Email:</strong> support@ezymemo.com
              </p>
              <p className="text-gray-600">
                <strong>Website:</strong> <Link href="/contact" className="text-blue-600 hover:underline">Contact Us</Link>
              </p>
              <p className="text-gray-600">
                <strong>Address:</strong> Dhaka, Bangladesh
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
