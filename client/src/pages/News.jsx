import React, { useState } from 'react';
import {
  FaNewspaper,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaSearch,
  FaTags,
} from 'react-icons/fa';

// Extended news data
const allNews = [
  {
    id: 1,
    title: 'Auction Season Kicks Off with a Bang!',
    summary:
      'The much-anticipated auction season has finally begun, with teams battling it out for the best talent in the league...',
    content: `The auction season has officially commenced with unprecedented excitement and record-breaking participation. Teams from across the globe have gathered to secure the finest talent available in the market.

This year's auction promises to be the most competitive yet, with over 500 players registered and 32 teams participating. The opening day saw some surprising moves as traditional powerhouses were challenged by emerging teams with deep pockets.

Key highlights from the opening session:
• Record-breaking bids for star players
• New team strategies emerging
• Unexpected player movements
• Technology integration enhancing the bidding experience

The auction will continue for the next two weeks, with specialized sessions for different player categories including batsmen, bowlers, all-rounders, and wicket-keepers.`,
    image:
      'https://kheltoday.com/wp-content/uploads/2023/10/Bengal-Warriors-management-during-the-PKL-Season-10-Player-Auction-scaled.jpg',
    author: 'Sports Desk',
    date: '2025-08-06',
    time: '10:30 AM',
    category: 'Auction',
    featured: true,
  },
  {
    id: 2,
    title: 'New Record Set for Most Expensive Player',
    summary:
      'A new record was set today as a star player was sold for a staggering amount, shattering all previous records...',
    content: `In a stunning turn of events, the auction world witnessed history being made as veteran all-rounder Marcus Thompson was sold for a record-breaking $12.5 million, surpassing the previous record by a significant margin.

The bidding war for Thompson was intense, with five teams competing fiercely for his services. The final battle came down to the Mumbai Tigers and the Delhi Dynamos, with the Tigers ultimately securing his signature.

Thompson's impressive stats that led to this record bid:
• 450+ international matches
• 8,500+ runs scored
• 320+ wickets taken
• 95% match-winning contribution rate

This acquisition is expected to transform the Tigers' prospects for the upcoming season, making them immediate title contenders.`,
    image:
      'https://uccricket.live/wp-content/uploads/2024/11/Rishab-Pant-768x368.webp',
    author: 'Michael Chen',
    date: '2025-08-05',
    time: '3:45 PM',
    category: 'Record',
    featured: true,
  },
  {
    id: 3,
    title: 'Young Talent Shines in Rookie Auction',
    summary:
      'Fresh faces dominated the rookie auction as teams invested heavily in upcoming stars...',
    content: `The rookie auction segment proved to be a revelation as young talents commanded impressive prices, signaling a shift towards investing in future potential.

18-year-old batting sensation Sarah Williams became the most expensive rookie ever sold, fetching $2.8 million from the Chennai Challengers. Her domestic performance this season has been nothing short of spectacular.

Other notable rookie acquisitions:
• Jake Morrison (Fast Bowler) - $2.1M to Kolkata Knights
• Priya Sharma (Wicket-keeper) - $1.9M to Rajasthan Royals
• Alex Rodriguez (All-rounder) - $2.3M to Bangalore Bulls

Teams are clearly prioritizing long-term growth over immediate impact, with many franchises building their core around these young talents.`,
    image:
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop&q=60',
    author: 'Emma Johnson',
    date: '2025-08-04',
    time: '11:20 AM',
    category: 'Rookie',
    featured: false,
  },
  {
    id: 4,
    title: 'Technology Revolution in Modern Auctions',
    summary:
      'AI-powered analytics and real-time data visualization are transforming how teams make bidding decisions...',
    content: `The integration of advanced technology has revolutionized the auction experience, with teams now relying on sophisticated analytics to make informed decisions.

Real-time player performance analytics, powered by machine learning algorithms, provide teams with instant insights into player value, injury risks, and performance predictions.

Key technological innovations:
• AI-powered bidding recommendations
• Real-time performance analytics
• Virtual reality player assessment
• Blockchain-based contract management
• Mobile bidding applications

This technological advancement has leveled the playing field, allowing smaller teams to compete with traditional powerhouses through data-driven strategies.`,
    image:
      'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&auto=format&fit=crop&q=60',
    author: 'Tech Reporter',
    date: '2025-08-03',
    time: '9:15 AM',
    category: 'Technology',
    featured: false,
  },
  {
    id: 5,
    title: 'International Players Bring Global Flavor',
    summary:
      'The auction sees unprecedented international participation with players from over 25 countries...',
    content: `This year's auction has truly become a global affair with players from 25+ countries participating, bringing diverse playing styles and strategies to the league.

The international contingent includes stars from traditional cricket nations as well as emerging markets, creating an exciting blend of experience and fresh perspectives.

Notable international signings:
• Kumar Patel (India) - Exceptional spin bowling
• James Mitchell (England) - Aggressive batting style
• Carlos Santos (Brazil) - Innovative fielding techniques
• Yuki Tanaka (Japan) - Strategic game awareness

This international diversity is expected to elevate the overall quality of play and provide fans with a truly global entertainment experience.`,
    image:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&auto=format&fit=crop&q=60',
    author: 'Global Sports',
    date: '2025-08-02',
    time: '2:30 PM',
    category: 'International',
    featured: false,
  },
  {
    id: 6,
    title: 'Team Strategies: Building Championship Squads',
    summary:
      'Analysis of different team approaches to squad building in the current auction...',
    content: `Teams have adopted varied strategies in this auction, from aggressive spending on star players to balanced portfolio approaches focusing on team chemistry.

The Mumbai Tigers have opted for a star-heavy approach, spending big on established names, while the Chennai Challengers have focused on building a balanced squad with equal investment across all departments.

Strategic approaches observed:
• Star Player Strategy - Heavy investment in 2-3 marquee players
• Balanced Portfolio - Equal distribution across team roles
• Youth Focus - Investing in upcoming talent
• Experience Banking - Acquiring seasoned campaigners
• Specialist Hunting - Targeting specific skill sets

These diverse strategies will make for an exciting season as different philosophies clash on the field.`,
    image:
      'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&auto=format&fit=crop&q=60',
    author: 'Strategy Analyst',
    date: '2025-08-01',
    time: '4:00 PM',
    category: 'Strategy',
    featured: false,
  },
];

const categories = [
  'All',
  'Auction',
  'Record',
  'Technology',
  'International',
  'Strategy',
];

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);

  const filteredNews = allNews.filter((news) => {
    const categoryMatch =
      selectedCategory === 'All' || news.category === selectedCategory;
    const searchMatch =
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const featuredNews = filteredNews.filter((news) => news.featured);
  const regularNews = filteredNews.filter((news) => !news.featured);

  if (selectedNews) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="h-[4vh]"></div>
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => setSelectedNews(null)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors text-sm"
          >
            <FaArrowLeft className="text-sm" /> Back to News
          </button>

          <article className="max-w-4xl mx-auto">
            <img
              src={selectedNews.image}
              alt={selectedNews.title}
              className="w-full h-48 md:h-64 object-cover rounded-lg mb-4"
            />

            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-purple-600 text-white text-xs rounded-full mb-3">
                <FaTags className="inline mr-1 text-xs" />
                {selectedNews.category}
              </span>

              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {selectedNews.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs mb-4">
                <span className="flex items-center gap-1">
                  <FaUser className="text-xs" /> {selectedNews.author}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="text-xs" />{' '}
                  {new Date(selectedNews.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock className="text-xs" /> {selectedNews.time}
                </span>
              </div>
            </div>

            <div className="prose prose-sm prose-invert max-w-none">
              {selectedNews.content.split('\n\n').map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-3 text-gray-300 leading-relaxed text-sm"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="h-[4vh]"></div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <FaNewspaper className="inline-block mr-2" />
          AuctionSphere News
        </h1>
        <p className="text-gray-400 text-base max-w-2xl mx-auto">
          Stay updated with the latest happenings in the auction world, player
          transfers, and league developments.
        </p>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section className="container mx-auto px-4 mb-8">
          <h2 className="text-xl font-bold mb-4 text-center">
            Featured Stories
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredNews.map((news) => (
              <div
                key={news.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedNews(news)}
              >
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <span className="inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded-full mb-2">
                    {news.category}
                  </span>
                  <h3 className="text-lg font-bold mb-2 text-purple-400 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {news.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-xs" /> {news.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />{' '}
                      {new Date(news.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Regular News */}
      <section className="container mx-auto px-4 pb-8">
        {regularNews.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">
              Latest Updates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularNews.map((news) => (
                <div
                  key={news.id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedNews(news)}
                >
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <span className="inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded-full mb-2">
                      {news.category}
                    </span>
                    <h3 className="text-base font-bold mb-2 text-purple-400 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                      {news.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate">{news.author}</span>
                      <span className="flex-shrink-0">
                        {new Date(news.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {filteredNews.length === 0 && (
          <div className="text-center py-8">
            <FaNewspaper className="text-4xl text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-400 mb-2">
              No News Found
            </h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default News;
