import { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Head from 'next/head';
export default function FAQ() {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const faqData = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      questions: [
        {
          id: 'create-account',
          question: 'How do I create an account?',
          answer:
            'Creating an account is quick and easy! Simply click the "Register" button in the top right corner and fill out the required information. You&apos;ll need to provide your email, create a password, and verify your email address to get started.',
        },
        {
          id: 'free-to-join',
          question: 'Is it free to join?',
          answer:
            'Yes, joining Bin Cleaning Classifieds is completely free! You can create an account, browse listings, and contact sellers without any cost. We only charge a small fee when you successfully sell an item through our platform.',
        },
        {
          id: 'platform-features',
          question: 'What can I do on this platform?',
          answer:
            'Our platform allows you to buy and sell pressure washing equipment, bin cleaning trucks, complete businesses, and related accessories. You can post listings, search for specific items, contact sellers, and build your cleaning business network.',
        },
      ],
    },
    {
      id: 'account-verification',
      title: 'Account & Verification',
      questions: [
        {
          id: 'verify-account',
          question: 'How do I verify my account?',
          answer:
            'Account verification helps build trust in our marketplace. After registering, check your email for a verification link. You can also add additional verification by providing a phone number and uploading identification documents in your account settings.',
        },
        {
          id: 'change-details',
          question: 'Can I change my username or email?',
          answer:
            'You can update your email address in your account settings at any time. Username changes are possible but limited to once every 30 days. Contact our support team if you need assistance with these changes.',
        },
        {
          id: 'forgot-password',
          question: 'What happens if I forget my password?',
          answer:
            'No worries! Click the "Forgot Password" link on the sign-in page, enter your email address, and we&apos;ll send you a secure link to reset your password. Make sure to check your spam folder if you don&apos;t see the email.',
        },
      ],
    },
    {
      id: 'listings-posting',
      title: 'Listings & Posting',
      questions: [
        {
          id: 'create-listing',
          question: 'How do I create a new listing?',
          answer:
            'Click "Post a Listing" from the main navigation, then fill out the listing form with details about your item. Include high-quality photos, accurate descriptions, and competitive pricing to attract buyers. Your listing will be live immediately after submission.',
        },
        {
          id: 'photo-limit',
          question: 'How many photos can I add to my listing?',
          answer:
            'You can upload up to 10 high-quality photos per listing. We recommend including multiple angles, close-ups of important features, and any documentation or certifications. Good photos significantly increase your chances of a successful sale.',
        },
        {
          id: 'edit-listing',
          question: 'Can I edit my listing after posting?',
          answer:
            'Absolutely! You can edit your listings at any time through your account dashboard. You can update prices, descriptions, add or remove photos, and mark items as sold. Keep your listings current to maintain buyer interest.',
        },
      ],
    },
    {
      id: 'safety-trust',
      title: 'Safety & Trust',
      questions: [
        {
          id: 'user-safety',
          question: 'How do you ensure user safety?',
          answer:
            'We take safety seriously with account verification, secure messaging systems, and community reporting tools. We recommend meeting in public places for transactions, inspecting equipment before purchase, and trusting your instincts when dealing with other users.',
        },
        {
          id: 'suspicious-user',
          question: 'What should I do if I encounter a suspicious user?',
          answer:
            'If you encounter suspicious behavior, use the "Report User" button on their profile or listing. Our team investigates all reports promptly. Never share personal financial information outside our secure platform.',
        },
        {
          id: 'personal-details',
          question: 'Are my personal details shared with other users?',
          answer:
            'We protect your privacy. Other users can only see your username, general location (city/state), and any information you choose to include in your profile. Your email, phone number, and personal details remain private.',
        },
      ],
    },
    {
      id: 'contact-support',
      title: 'Contact & Support',
      questions: [
        {
          id: 'contact-support',
          question: 'How can I contact customer support?',
          answer:
            'Reach out to our support team through the "Contact Support" button in your account dashboard, or email us directly at support@bincleaningclassifieds.com. We strive to respond to all inquiries within 24 hours.',
        },
        {
          id: 'support-hours',
          question: 'What are your support hours?',
          answer:
            'Our support team is available Monday through Friday from 8:00 AM to 6:00 PM EST. We also monitor and respond to urgent issues on weekends. For immediate assistance, use our priority support system.',
        },
        {
          id: 'phone-support',
          question: 'Do you offer phone support?',
          answer:
            'Yes! Premium members have access to phone support during business hours. All users can schedule phone consultations for complex issues or business-related inquiries through their account dashboard.',
        },
      ],
    },
  ];

  return (
    <Layout>
      <Head>
        <title>FAQ - Bin Cleaning Classifieds</title>
        <meta
          name='description'
          content='Frequently asked questions about Bin Cleaning Classifieds'
        />
      </Head>
      <div className='bg-white'>
        {/* Dark Hero Section */}
        <section
          className='bg-gray-900 py-16'
          style={{
            backgroundImage: `url('/FRAME-1.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
          }}
        >
          <div className='max-w-4xl mx-auto px-6 text-center'>
            <h1 className='text-white text-4xl font-medium font-sans leading-10 mb-4'>
              Frequently Asked Questions
            </h1>
            <p className='text-stone-300 text-lg font-normal font-sans leading-7'>
              Got questions? We&apos;ve got clear, no-fluff answers.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className='py-16'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-12'>
              {/* FAQ Content - Left Side */}
              <div className='lg:col-span-3'>
                <div className='space-y-16'>
                  {faqData.map((section) => (
                    <div key={section.id}>
                      {/* Section Title */}
                      <h2 className='text-zinc-800 text-2xl font-normal font-sans leading-loose mb-6'>
                        {section.title}
                      </h2>

                      {/* Questions */}
                      <div className='space-y-4'>
                        {section.questions.map((item) => (
                          <div
                            key={item.id}
                            className='border border-neutral-200 rounded-lg overflow-hidden'
                          >
                            {/* Question Button */}
                            <button
                              onClick={() => toggleSection(item.id)}
                              className='w-full px-4 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between'
                            >
                              <span className='text-zinc-800 text-lg font-normal font-sans leading-7'>
                                {item.question}
                              </span>
                              <svg
                                className={`w-4 h-4 text-stone-500 transition-transform ${
                                  openSections[item.id] ? 'rotate-180' : ''
                                }`}
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 9l-7 7-7-7'
                                />
                              </svg>
                            </button>

                            {/* Answer */}
                            {openSections[item.id] && (
                              <div className='px-4 py-4 bg-gray-50 border-t border-neutral-200'>
                                <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                                  {item.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar - Right Side */}
              <div className='lg:col-span-1'>
                <div className='sticky top-8'>
                  <div className='bg-white border border-gray-200 rounded-xl p-6'>
                    <div className='flex items-center gap-2 mb-4'>
                      <svg
                        className='w-5 h-5 text-green-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      <h3 className='text-black text-lg font-normal font-sans leading-7'>
                        Still have questions?
                      </h3>
                    </div>

                    <p className='text-stone-500 text-base font-normal font-sans leading-normal mb-6'>
                      Our support team is here to help you with any specific
                      questions.
                    </p>

                    <Link
                      href='/contact'
                      className='block w-full bg-gray-900 hover:bg-gray-800 text-white text-base font-normal font-sans text-center py-3 px-4 rounded-lg transition-colors'
                    >
                      <div className='flex items-center justify-center gap-2'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                          />
                        </svg>
                        Contact Support
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className='bg-gray-900 py-16'>
          <div className='max-w-4xl mx-auto px-6 text-center'>
            <h2 className='text-white text-2xl font-normal font-sans leading-loose mb-8'>
              Ready to explore listings or post your own?
            </h2>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/browse-listings'
                className='bg-green-600 hover:bg-green-700 text-white text-base font-normal font-sans px-8 py-3 rounded-lg transition-colors'
              >
                Browse Listings
              </Link>
              <Link
                href='/dashboard/post-new-listing'
                className='bg-white hover:bg-gray-100 text-gray-900 text-base font-normal font-sans px-8 py-3 rounded-lg transition-colors'
              >
                Post a Listing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
