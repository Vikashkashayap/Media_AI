export default function UseCasesSection() {
  const useCases = [
    {
      title: 'Social Media Marketing',
      description: 'Create engaging posts, stories, and reels for Instagram, Facebook, and TikTok in minutes.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
        
      ),
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Blog Content Creation',
      description: 'Generate SEO-optimized blog posts, articles, and long-form content with AI assistance.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Video Content',
      description: 'Produce viral-worthy reels and short-form videos with AI-generated scripts and ideas.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Brand Marketing',
      description: 'Design professional marketing materials, banners, and visual content for your brand.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#0f1429]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Perfect for Every Digital Media Need
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Whether you're a solo creator or managing a brand, we've got you covered
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${useCase.gradient} opacity-10 blur-3xl rounded-full`} />
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${useCase.gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {useCase.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{useCase.title}</h3>
                <p className="text-gray-400 leading-relaxed">{useCase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

