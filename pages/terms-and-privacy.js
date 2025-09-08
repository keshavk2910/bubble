import Head from 'next/head';
import { useState } from 'react';
import Image from 'next/image';
import Layout from '@/components/Layout';
export default function TermsAndPrivacy() {
  const [activeTab, setActiveTab] = useState('terms');

  const navigationSections = [
    { id: 'introduction', label: 'Introduction', icon: '/SVG.svg' },
    { id: 'definitions', label: 'Definitions', icon: '/SVG-1.svg' },
    { id: 'user-rights', label: 'User Rights', icon: '/SVG-2.svg' },
    { id: 'data-collection', label: 'Data Collection', icon: '/SVG-3.svg' },
    { id: 'legal-compliance', label: 'Legal Compliance', icon: '/SVG-4.svg' },
    { id: 'changes', label: 'Changes to Terms', icon: '/SVG-5.svg' },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Layout>
      <Head>
        <title>
          Terms of Service & Privacy Policy - Bin Cleaning Classifieds
        </title>
        <meta
          name='description'
          content='Read our terms of service and privacy policy to understand your rights and responsibilities.'
        />
      </Head>
      <div className='w-full bg-white overflow-hidden'>
        {/* Hero Section with Background */}
        <section className='w-full h-72 relative bg-gray-900 overflow-hidden'>
          {/* Background overlay for text readability */}
          <div className='absolute inset-0 bg-gray-900/60 z-10'></div>

          {/* Hero Content */}
          <div className='absolute inset-0 z-20 flex items-center justify-center'>
            <div className='text-center max-w-2xl px-6'>
              <h1 className='text-white text-4xl font-bold font-sans mb-4'>
                Terms & Privacy
              </h1>
              <p className='text-stone-300 text-lg font-normal font-sans leading-7'>
                Please review our terms of service and privacy policy carefully.
                These documents outline your rights and responsibilities when
                using our services.
              </p>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className='max-w-4xl mx-auto px-6 pt-8'>
          <div className='flex gap-4 mb-8'>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-6 py-4 text-base font-normal font-sans leading-normal relative ${
                activeTab === 'terms' ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              Terms of Service
              {activeTab === 'terms' && (
                <div className='absolute bottom-0 left-6 right-6 h-0.5 bg-gray-900'></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-4 text-base font-normal font-sans leading-normal ${
                activeTab === 'privacy' ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              Privacy Policy
            </button>
          </div>

          {/* Quick Navigation */}
          <div className='mb-12'>
            <h2 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-6'>
              Quick Navigation
            </h2>
            <div className='flex flex-wrap gap-3'>
              {navigationSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className='flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-2 hover:bg-gray-100 transition-colors'
                >
                  <div className='w-4 h-4'>
                    <Image
                      src={section.icon}
                      alt={section.label}
                      width={16}
                      height={16}
                      className='w-full h-full'
                    />
                  </div>
                  <span className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    {section.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className='max-w-4xl mx-auto px-6 pb-16'>
          <div className='max-w-2xl'>
            {/* Introduction Section */}
            <section id='introduction' className='mb-16'>
              <h2 className='text-gray-700 text-2xl font-semibold font-sans leading-loose mb-6'>
                Introduction
              </h2>
              <div className='space-y-6 text-gray-700 text-base font-normal font-sans leading-normal'>
                <p>
                  Welcome to CompanyName. These Terms of Service (
                  <span>&quot;Terms&quot;</span>) govern your access to and use
                  of our website, products, and services (
                  <span>&quot;Services&quot;</span>). By accessing or using our
                  Services, you agree to be bound by these Terms and our Privacy
                  Policy.
                </p>
                <p>
                  Please read these Terms carefully before using our Services.
                  If you do not agree to these Terms, you may not access or use
                  our Services. Our Privacy Policy describes how we handle the
                  information you provide to us when you use our Services.
                </p>
              </div>

              {/* Important Notice Box */}
              <div className='mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6'>
                <div className='flex gap-4'>
                  <div className='w-5 h-5 flex-shrink-0 mt-0.5'>
                    <Image
                      src='/SVG-6.svg'
                      alt='Important notice'
                      width={20}
                      height={16}
                    />
                  </div>
                  <div>
                    <h3 className='text-gray-700 text-base font-normal font-sans leading-normal mb-4 font-semibold'>
                      Important Notice
                    </h3>
                    <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                      By using our Services, you acknowledge that you have read
                      and understood these Terms and agree to be bound by them.
                      If you are using our Services on behalf of a company,
                      organization, or other entity, you represent that you have
                      the authority to bind that entity to these Terms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Definitions Section */}
            <section id='definitions' className='mb-16'>
              <h2 className='text-gray-700 text-2xl font-semibold font-sans leading-loose mb-6'>
                Definitions
              </h2>
              <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-6'>
                Throughout these Terms, we use certain defined terms. To help
                you understand these Terms, we&apos;ve defined these terms
                below:
              </p>
              <div className='space-y-4'>
                <div className='flex gap-2'>
                  <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    <span>&quot;Account&quot;</span> means a unique account
                    created for you to access our Services.
                  </p>
                </div>
                <div className='flex gap-2'>
                  <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    <span>&quot;Content&quot;</span> means any text, images,
                    videos, audio, or other material that you upload, post, or
                    otherwise share using our Services.
                  </p>
                </div>
                <div className='flex gap-2'>
                  <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    <span>&quot;User&quot;</span> means any individual who
                    accesses or uses our Services.
                  </p>
                </div>
                <div className='flex gap-2'>
                  <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    <span>&quot;Personal Data&quot;</span> means any information
                    relating to an identified or identifiable natural person.
                  </p>
                </div>
                <div className='flex gap-2'>
                  <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    <span>&quot;Services&quot;</span> means our website,
                    applications, and any other products or services offered by
                    CompanyName.
                  </p>
                </div>
              </div>
            </section>

            {/* User Rights and Responsibilities Section */}
            <section id='user-rights' className='mb-16'>
              <h2 className='text-gray-700 text-2xl font-semibold font-sans leading-loose mb-6'>
                User Rights and Responsibilities
              </h2>
              <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-8'>
                When you use our Services, you have certain rights and
                responsibilities. We&apos;ve outlined these below to ensure a
                positive experience for all users.
              </p>

              <div className='space-y-8'>
                {/* Account Registration */}
                <div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    Account Registration
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    To access certain features of our Services, you may need to
                    create an account. When you create an account, you must
                    provide accurate and complete information. You are
                    responsible for maintaining the confidentiality of your
                    account credentials and for all activities that occur under
                    your account.
                  </p>
                </div>

                {/* Acceptable Use */}
                <div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    Acceptable Use
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
                    You agree to use our Services only for lawful purposes and
                    in accordance with these Terms. You agree not to use our
                    Services:
                  </p>
                  <div className='space-y-3 ml-4'>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        In any way that violates any applicable federal, state,
                        local, or international law or regulation.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        To transmit, or procure the sending of, any advertising
                        or promotional material, including any{' '}
                        <span>&quot;junk mail&quot;</span>,{' '}
                        <span>&quot;chain letter&quot;</span>,{' '}
                        <span>&quot;spam&quot;</span>, or any other similar
                        solicitation.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        To impersonate or attempt to impersonate CompanyName, a
                        CompanyName employee, another user, or any other person
                        or entity.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        To engage in any other conduct that restricts or
                        inhibits anyone&apos;s use or enjoyment of the Services,
                        or which may harm CompanyName or users of the Services.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Your Content Box */}
                <div className='bg-blue-50 rounded-xl border border-blue-200 p-6'>
                  <h4 className='text-gray-700 text-base font-normal font-sans leading-normal mb-4 font-semibold'>
                    Your Content
                  </h4>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    You retain ownership of any Content you submit, post, or
                    display on or through our Services. By submitting, posting,
                    or displaying Content on or through our Services, you grant
                    us a worldwide, non-exclusive, royalty-free license to use,
                    reproduce, modify, adapt, publish, translate, create
                    derivative works from, distribute, and display such Content.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Collection and Use Section */}
            <section id='data-collection' className='mb-16'>
              <h2 className='text-gray-700 text-2xl font-semibold font-sans leading-loose mb-6'>
                Data Collection and Use
              </h2>
              <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-8'>
                We collect and use your information as described in our Privacy
                Policy. By using our Services, you consent to our data practices
                as described in our Privacy Policy.
              </p>

              <div className='space-y-8'>
                {/* Information We Collect */}
                <div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    Information We Collect
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
                    We collect several types of information from and about users
                    of our Services, including:
                  </p>
                  <div className='space-y-3 ml-4'>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        Personal Data: We may collect personal information that
                        you provide directly to us, such as your name, email
                        address, and contact information.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        Usage Data: We may collect information about how you
                        access and use our Services, including your IP address,
                        browser type, operating system, and other usage
                        information.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        Cookies and Similar Technologies: We may use cookies and
                        similar tracking technologies to collect information
                        about your browsing activities over time and across
                        different websites.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How We Use Your Information */}
                <div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    How We Use Your Information
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
                    We use the information we collect for various purposes,
                    including:
                  </p>
                  <div className='space-y-3 ml-4'>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        To provide, maintain, and improve our Services.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        To process transactions and send related information,
                        including confirmations and invoices.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        To send administrative messages, such as updates,
                        security alerts, and support messages.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        To respond to your comments, questions, and requests.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        To monitor and analyze trends, usage, and activities in
                        connection with our Services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Legal Compliance Section */}
            <section id='legal-compliance' className='mb-16'>
              <h2 className='text-gray-700 text-2xl font-semibold font-sans leading-loose mb-6'>
                Legal Compliance
              </h2>
              <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-8'>
                We are committed to complying with all applicable laws and
                regulations. This section outlines our legal obligations and
                your rights under various laws.
              </p>

              <div className='space-y-8'>
                {/* GDPR Compliance */}
                <div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    GDPR Compliance
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
                    If you are a resident of the European Economic Area (EEA),
                    you have certain rights under the General Data Protection
                    Regulation (GDPR), including:
                  </p>
                  <div className='space-y-3 ml-4'>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to access your personal data.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to rectify inaccurate personal data.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to erasure of your personal data.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to restrict processing of your personal data.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to data portability.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to object to processing of your personal data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CCPA Compliance */}
                <div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    CCPA Compliance
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
                    If you are a California resident, you have certain rights
                    under the California Consumer Privacy Act (CCPA), including:
                  </p>
                  <div className='space-y-3 ml-4'>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to know what personal information we collect
                        about you.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to delete personal information we have
                        collected from you.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to opt-out of the sale of your personal
                        information.
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <div className='w-1 h-1 bg-gray-600 rounded-full mt-3 flex-shrink-0'></div>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        The right to non-discrimination for exercising your CCPA
                        rights.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Legal Requests Box */}
                <div className='bg-red-50 rounded-xl border border-red-200 p-6'>
                  <div className='flex gap-4'>
                    <div className='w-5 h-5 flex-shrink-0 mt-0.5'>
                      <Image
                        src='/SVG-7.svg'
                        alt='Legal notice'
                        width={20}
                        height={20}
                        className='text-red-500'
                      />
                    </div>
                    <div>
                      <h4 className='text-gray-700 text-base font-normal font-sans leading-normal mb-4 font-semibold'>
                        Legal Requests
                      </h4>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        We may disclose your information if we believe in good
                        faith that such disclosure is necessary to (a) comply
                        with relevant laws or to respond to subpoenas or
                        warrants served on us; or (b) protect or defend the
                        rights, property, or safety of CompanyName, users of the
                        Services, or others.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Changes to Terms Section */}
            <section id='changes' className='mb-16'>
              <h2 className='text-gray-700 text-2xl font-semibold font-sans leading-loose mb-6'>
                Changes to Terms
              </h2>
              <div className='space-y-6'>
                <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                  We may revise and update these Terms from time to time in our
                  sole discretion. All changes are effective immediately when we
                  post them, and apply to all access to and use of the Services
                  thereafter.
                </p>
                <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                  Your continued use of the Services following the posting of
                  revised Terms means that you accept and agree to the changes.
                  You are expected to check this page frequently so you are
                  aware of any changes, as they are binding on you.
                </p>

                {/* Notification Box */}
                <div className='bg-amber-50 rounded-xl border border-amber-200 p-6'>
                  <div className='flex gap-4'>
                    <div className='w-5 h-5 flex-shrink-0 mt-0.5'>
                      <Image
                        src='/SVG-8.svg'
                        alt='Notification'
                        width={20}
                        height={20}
                      />
                    </div>
                    <div>
                      <h4 className='text-gray-700 text-base font-normal font-sans leading-normal mb-4 font-semibold'>
                        Notification of Changes
                      </h4>
                      <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                        We will make reasonable efforts to notify you of any
                        material changes to these Terms. We may provide
                        notification through a prominent notice on our Services
                        or by sending an email to the email address associated
                        with your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Terms Acceptance Section */}
            <section className='mb-16'>
              <h2 className='text-gray-700 text-2xl font-semibold font-sans leading-loose mb-6'>
                Terms Acceptance
              </h2>
              <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-6'>
                By using our Services, you acknowledge that you have read and
                understood these Terms and agree to be bound by them. During
                registration, you will be asked to explicitly accept these
                terms.
              </p>

              {/* Acceptance Form */}
              <div className='bg-green-50 rounded-xl border border-green-200 p-6'>
                <div className='flex items-start gap-3 mb-4'>
                  <input
                    type='checkbox'
                    id='terms-acceptance'
                    className='mt-1 w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500'
                  />
                  <label
                    htmlFor='terms-acceptance'
                    className='text-gray-700 text-base font-normal font-sans leading-normal'
                  >
                    I have read and agree to the Terms of Service and Privacy
                    Policy
                  </label>
                </div>
                <button className='bg-green-600 text-white text-base font-normal font-sans leading-normal px-6 py-3 rounded-md hover:bg-green-700 transition-colors'>
                  Complete Registration
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </Layout>
  );
}
