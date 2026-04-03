import { useState, useEffect } from 'react';
import { CheckCircle, MessageCircle, Truck, Palette, ArrowRight, ArrowLeft } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps: Step[] = [
    {
      id: 1,
      title: "Curate & Inquire",
      description: "Scroll. Click. Curate. You handpick the goodies. We prep the magic. Drop your inquiry like you're assembling the dream team — because, well, you are.",
      icon: <Palette className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      title: "We'll Reach Out Within 30 min.",
      description: "Our team gets in touch. Email, call, or WhatsApp — whatever works for you. Expect answers. Expect clarity.",
      icon: <MessageCircle className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Design Finalized, Printing Initiated",
      description: "You approve the magic. Once confirmed, our production team starts bringing your vision to life — pixel-perfect and print-ready. You relax. We hustle.",
      icon: <CheckCircle className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop"
    },
    {
      id: 4,
      title: "Swift Delivery, Nationwide",
      description: "Fast. Reliable. Nationwide. Whether by road or air, we deliver your gifts like a boss. You get tracking, updates, and peace of mind — no sweaty palms required.",
      icon: <Truck className="w-6 h-6" />,
      image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=200&fit=crop"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-6 md:py-8 bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-8 left-6 w-12 h-12 border border-gray-200 rotate-45 animate-pulse"></div>
        <div className="absolute top-16 right-12 w-10 h-10 bg-gray-100 rounded-full animate-bounce"></div>
        <div className="absolute bottom-8 left-1/4 w-6 h-6 border-2 border-gray-300 transform rotate-12 animate-ping"></div>
        <div className="absolute bottom-16 right-1/3 w-12 h-12 border border-gray-200 rounded-lg animate-pulse"></div>
        
        {/* Additional Graphics Elements */}
        <div className="absolute top-1/4 left-1/6 w-8 h-8 border border-gray-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/6 w-6 h-6 bg-gray-200 rounded-lg animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-10 h-10 border-2 border-gray-400 transform rotate-45 animate-ping" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-7 h-7 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        
        {/* Decorative Lines */}
        <div className="absolute top-1/2 left-0 w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent transform -rotate-45"></div>
        <div className="absolute top-1/2 right-0 w-16 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent transform rotate-45"></div>
        <div className="absolute left-1/2 top-0 w-px h-16 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
        <div className="absolute left-1/2 bottom-0 w-px h-16 bg-gradient-to-t from-transparent via-gray-300 to-transparent"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block mb-3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-3 tracking-tight">
              How It Works
            </h2>
            <div className="w-20 h-1 bg-black mx-auto"></div>
          </div>
          <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            From Click to Gifted — The Gift Experience, Refined.
          </p>
        </div>

        {/* Desktop Timeline Layout */}
        <div className="hidden lg:block relative">
          {/* Central Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2 z-10">
            <div className="h-full bg-gradient-to-b from-black via-gray-600 to-black shadow-lg"></div>
          </div>

          {/* Steps Container */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Step Circle and Label on Timeline */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
                  {/* Animated Circle */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${
                    activeStep === step.id 
                      ? 'bg-black text-white scale-125 ring-4 ring-gray-200 shadow-2xl' 
                      : 'bg-white text-black border-4 border-gray-300 shadow-xl'
                  }`}>
                    <div className={`transition-all duration-500 ${activeStep === step.id ? 'scale-110' : 'scale-100'}`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  {/* Step Number */}
                  <div className="mt-2 text-center">
                    <span className={`text-sm font-black px-3 py-1 rounded-full transition-all duration-500 shadow-md ${
                      activeStep === step.id 
                        ? 'bg-black text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 shadow-sm'
                    }`}>
                      STEP {step.id}
                    </span>
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-10' : 'pl-10'}`}>
                  <div className={`relative bg-gray-100 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-700 transform ${
                    activeStep === step.id ? 'scale-105 -translate-y-1' : 'scale-100'
                  } border-2 ${activeStep === step.id ? 'border-black shadow-2xl' : 'border-gray-300 shadow-xl'}`}>
                    
                    {/* Diagonal Rectangle Background Pattern */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-5">
                      <div className="absolute inset-0 transform rotate-12 scale-150">
                        <div className="absolute top-0 left-0 w-32 h-8 bg-black opacity-20 transform -rotate-45"></div>
                        <div className="absolute top-8 right-0 w-24 h-6 bg-black opacity-15 transform rotate-45"></div>
                        <div className="absolute bottom-4 left-1/4 w-20 h-4 bg-black opacity-10 transform -rotate-30"></div>
                        <div className="absolute bottom-8 right-1/3 w-16 h-3 bg-black opacity-8 transform rotate-60"></div>
                      </div>
                    </div>

                    {/* Additional Card Graphics */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-gray-400 rounded-full opacity-30"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-400 rounded-full opacity-30"></div>
                    <div className="absolute top-1/2 right-4 w-1 h-1 bg-gray-400 rounded-full opacity-40"></div>

                    <div className="relative z-10">
                      <div className="flex items-start space-x-4">
                        {/* Image Side */}
                        <div className="flex-shrink-0 w-2/5">
                          <div className={`relative overflow-hidden rounded-xl transition-all duration-500 shadow-lg ${
                            activeStep === step.id ? 'ring-2 ring-black shadow-xl' : 'ring-1 ring-gray-300 shadow-md'
                          }`}>
                            <img
                              src={step.image}
                              alt={step.title}
                              className={`w-full h-28 object-cover transition-all duration-700 ${
                                activeStep === step.id ? 'scale-110' : 'scale-100'
                              }`}
                            />
                            {/* Image Overlay */}
                            <div className={`absolute inset-0 bg-black transition-all duration-500 ${
                              activeStep === step.id ? 'opacity-0' : 'opacity-10'
                            }`}></div>
                            
                            {/* Image Corner Graphics */}
                            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-60"></div>
                            <div className="absolute bottom-1 left-1 w-2 h-2 bg-white rounded-full opacity-60"></div>
                          </div>
                        </div>
                        
                        {/* Text Side */}
                        <div className="flex-1">
                          <h3 className={`text-lg font-black mb-3 transition-all duration-500 ${
                            activeStep === step.id ? 'text-black' : 'text-gray-700'
                          }`}>
                            {step.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow Indicator */}
                    <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ${
                      index % 2 === 0 ? 'right-3' : 'left-3'
                    } ${activeStep === step.id ? 'opacity-100' : 'opacity-30'}`}>
                      {index % 2 === 0 ? (
                        <ArrowRight className="w-5 h-5 text-black" />
                      ) : (
                        <ArrowLeft className="w-5 h-5 text-black" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeline - Modern Cards */}
        <div className="lg:hidden">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Step Card */}
                <div className={`relative bg-gray-100 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-500 transform ${
                  activeStep === step.id ? 'scale-105 -translate-y-1' : 'scale-100'
                } border-2 ${activeStep === step.id ? 'border-black shadow-2xl' : 'border-gray-300 shadow-lg'}`}>
                  
                  {/* Diagonal Rectangle Background Pattern */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-5">
                    <div className="absolute inset-0 transform rotate-12 scale-150">
                      <div className="absolute top-0 left-0 w-20 h-6 bg-black opacity-20 transform -rotate-45"></div>
                      <div className="absolute top-6 right-0 w-16 h-4 bg-black opacity-15 transform rotate-45"></div>
                      <div className="absolute bottom-2 left-1/4 w-12 h-3 bg-black opacity-10 transform -rotate-30"></div>
                      <div className="absolute bottom-6 right-1/3 w-10 h-2 bg-black opacity-8 transform rotate-60"></div>
                    </div>
                  </div>

                  {/* Additional Mobile Card Graphics */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-gray-400 rounded-full opacity-30"></div>
                  <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-30"></div>

                  <div className="relative z-10">
                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {/* Icon Circle */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
                          activeStep === step.id 
                            ? 'bg-black text-white scale-110 shadow-xl' 
                            : 'bg-white text-gray-600 border-2 border-gray-300 shadow-md'
                        }`}>
                          <div className={`transition-all duration-300 ${activeStep === step.id ? 'scale-110' : 'scale-100'}`}>
                            {step.icon}
                          </div>
                        </div>
                        
                        {/* Step Number */}
                        <span className={`text-sm font-black px-3 py-1 rounded-full transition-all duration-500 shadow-md ${
                          activeStep === step.id 
                            ? 'bg-black text-white shadow-lg' 
                            : 'bg-white text-gray-600 shadow-sm'
                        }`}>
                          STEP {step.id}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-base font-black mb-2 transition-all duration-500 ${
                      activeStep === step.id ? 'text-black' : 'text-gray-700'
                    }`}>
                      {step.title}
                    </h3>
                    
                    {/* Content Layout */}
                    <div className="flex items-start space-x-3">
                      {/* Image */}
                      <div className="flex-shrink-0 w-1/3">
                        <div className={`relative overflow-hidden rounded-lg transition-all duration-500 shadow-md ${
                          activeStep === step.id ? 'ring-2 ring-black shadow-lg' : 'ring-1 ring-gray-300 shadow-sm'
                        }`}>
                          <img
                            src={step.image}
                            alt={step.title}
                            className={`w-full h-20 object-cover transition-all duration-700 ${
                              activeStep === step.id ? 'scale-110' : 'scale-100'
                            }`}
                          />
                          {/* Image Overlay */}
                          <div className={`absolute inset-0 bg-black transition-all duration-500 ${
                            activeStep === step.id ? 'opacity-0' : 'opacity-10'
                          }`}></div>
                          
                          {/* Mobile Image Corner Graphics */}
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                        </div>
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connecting Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 bottom-0 w-px transform -translate-x-1/2 z-0">
                    <div className="h-4 bg-gradient-to-b from-gray-300 to-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </section>
  );
};

export default HowItWorks; 