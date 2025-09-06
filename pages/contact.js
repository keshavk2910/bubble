import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Users,
  Shield,
  CheckCircle,
} from 'lucide-react';
import Layout from '@/components/Layout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageCircle },
    { value: 'support', label: 'Technical Support', icon: Shield },
    { value: 'business', label: 'Business Partnership', icon: Users },
    { value: 'listing', label: 'Listing Help', icon: Mail },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@bubblebinz.com',
      description: 'Send us an email anytime',
      color: 'bg-blue-50 border-blue-200 text-blue-600',
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-6PM EST',
      color: 'bg-green-50 border-green-200 text-green-600',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Business Ave, Suite 100',
      description: 'Philadelphia, PA 19103',
      color: 'bg-purple-50 border-purple-200 text-purple-600',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Monday - Friday',
      description: '9:00 AM - 6:00 PM EST',
      color: 'bg-orange-50 border-orange-200 text-orange-600',
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Contact form submitted:', formData);
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after success
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          inquiryType: 'general',
        });
      }, 3000);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className='max-w-4xl mx-auto px-6 py-16 text-center'>
          <div className='bg-green-50 border border-green-200 rounded-xl p-12'>
            <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <CheckCircle className='w-8 h-8 text-white' />
            </div>
            <h1 className='text-gray-900 text-3xl font-bold font-sans mb-4'>
              Message Sent Successfully!
            </h1>
            <p className='text-gray-600 text-lg font-normal font-sans leading-7 mb-8'>
              Thank you for contacting us. We&apos;ll get back to you within 24
              hours.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className='bg-green-600 text-white text-base font-normal font-sans px-6 py-3 rounded-md hover:bg-green-700 transition-colors'
            >
              Send Another Message
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='max-w-7xl mx-auto px-6 py-16'>
        {/* Page Header */}
        <div className='text-center mb-16'>
          <h1 className='text-gray-900 text-4xl font-bold font-sans mb-4'>
            Get in Touch
          </h1>
          <p className='text-gray-600 text-xl font-normal font-sans leading-7 max-w-2xl mx-auto'>
            Have questions about our marketplace? Need help with your listing?
            We&apos;re here to help you succeed.
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16'>
          {/* Contact Information */}
          <div className='space-y-8'>
            <div>
              <h2 className='text-gray-900 text-2xl font-semibold font-sans mb-6'>
                Contact Information
              </h2>
              <p className='text-gray-600 text-base font-normal font-sans leading-7 mb-8'>
                Choose the best way to reach us. We&apos;re committed to
                providing excellent support for all our users.
              </p>
            </div>

            {/* Contact Methods Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className={`border rounded-xl p-6 transition-all hover:shadow-md ${method.color.replace(
                      'text-',
                      'hover:border-'
                    )}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                        method.color.split(' ')[0]
                      } ${method.color.split(' ')[1]}`}
                    >
                      <Icon
                        className={`w-6 h-6 ${method.color.split(' ')[2]}`}
                      />
                    </div>
                    <h3 className='text-gray-900 text-lg font-semibold font-sans mb-2'>
                      {method.title}
                    </h3>
                    <p className='text-gray-700 text-base font-normal font-sans mb-1'>
                      {method.details}
                    </p>
                    <p className='text-gray-500 text-sm font-normal font-sans'>
                      {method.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className='bg-gray-50 rounded-xl border border-gray-200 p-6'>
              <h3 className='text-gray-900 text-lg font-semibold font-sans mb-4'>
                Quick Response Times
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-green-600 rounded-full'></div>
                  <span className='text-gray-700 text-base font-normal font-sans'>
                    General inquiries: Within 4 hours
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                  <span className='text-gray-700 text-base font-normal font-sans'>
                    Technical support: Within 2 hours
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-purple-600 rounded-full'></div>
                  <span className='text-gray-700 text-base font-normal font-sans'>
                    Business partnerships: Within 24 hours
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className='bg-white rounded-xl border border-gray-200 p-8'>
            <div className='mb-8'>
              <h2 className='text-gray-900 text-2xl font-semibold font-sans mb-4'>
                Send us a Message
              </h2>
              <p className='text-gray-600 text-base font-normal font-sans leading-7'>
                Fill out the form below and we&apos;ll get back to you as soon
                as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Inquiry Type */}
              <div>
                <label className='block text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
                  What can we help you with?
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  {inquiryTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type='button'
                        onClick={() =>
                          handleInputChange('inquiryType', type.value)
                        }
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${
                          formData.inquiryType === type.value
                            ? 'bg-green-50 border-green-600 text-green-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className='w-5 h-5 flex-shrink-0' />
                        <span className='text-sm font-normal font-sans'>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name and Email Row */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
                  >
                    Full Name*
                  </label>
                  <input
                    type='text'
                    id='name'
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder='Your full name'
                    className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
                  >
                    Email Address*
                  </label>
                  <input
                    type='email'
                    id='email'
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder='your.email@example.com'
                    className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                    required
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor='subject'
                  className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
                >
                  Subject*
                </label>
                <input
                  type='text'
                  id='subject'
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder='Brief description of your inquiry'
                  className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor='message'
                  className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
                >
                  Message*
                </label>
                <textarea
                  id='message'
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder='Please provide details about your inquiry. The more information you provide, the better we can assist you.'
                  rows={6}
                  className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400 resize-none'
                  required
                />
              </div>

              {/* Submit Button */}
              <div className='flex items-center justify-between pt-4'>
                <p className='text-gray-500 text-sm font-normal font-sans'>
                  * Required fields
                </p>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='bg-green-600 text-white text-base font-normal font-sans px-8 py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin'></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className='w-4 h-4' />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className='mt-24 bg-slate-50 rounded-xl p-12'>
          <div className='text-center mb-12'>
            <h2 className='text-gray-900 text-3xl font-semibold font-sans mb-4'>
              Frequently Asked Questions
            </h2>
            <p className='text-gray-600 text-lg font-normal font-sans leading-7'>
              Quick answers to common questions about our marketplace.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {[
              {
                question: 'How do I create a listing?',
                answer:
                  "Click 'Post a Listing' in the navigation menu, fill out the required information, upload photos, and submit. Your listing will be reviewed and published within 24 hours.",
              },
              {
                question: 'Are there any fees to list items?',
                answer:
                  'Listing items is completely free. We only charge a small commission when your item sells successfully.',
              },
              {
                question: 'How do I contact sellers?',
                answer:
                  'Create a free account to contact sellers directly through our messaging system. You can also see their contact information on verified listings.',
              },
              {
                question: 'What payment methods are accepted?',
                answer:
                  'Payment terms are arranged directly between buyers and sellers. We recommend secure payment methods and meeting in safe, public locations.',
              },
              {
                question: 'How do I verify my business account?',
                answer:
                  'Business accounts can be verified by providing business registration documents and contact information. Verified accounts get priority placement and additional features.',
              },
              {
                question: 'Can I edit my listing after posting?',
                answer:
                  'Yes, you can edit your listings at any time through your account dashboard. Changes to price, description, and photos are updated immediately.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className='bg-white rounded-lg border border-gray-200 p-6'
              >
                <h3 className='text-gray-900 text-lg font-semibold font-sans mb-3'>
                  {faq.question}
                </h3>
                <p className='text-gray-600 text-base font-normal font-sans leading-7'>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className='text-center mt-12'>
            <p className='text-gray-600 text-base font-normal font-sans mb-4'>
              Still have questions?
            </p>
            <a
              href='/faq'
              className='text-green-600 text-base font-medium font-sans hover:text-green-700 transition-colors'
            >
              Visit our complete FAQ section →
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
