import React from "react";
import { Star } from "lucide-react";

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  content: string;
}

interface RatingStarsProps {
  rating: number;
}

interface ReviewCardProps {
  review: Review;
}

const dummyReviews: Review[] = [
  {
    id: 1,
    name: "Alex J.",
    rating: 5,
    date: "2 days ago",
    content:
      "Absolutely fantastic service! The product exceeded my expectations and arrived much sooner than anticipated. I highly recommend this to anyone looking for quality and reliability. I will definitely be a returning customer for future purchases.",
  },
  {
    id: 2,
    name: "Ben S.",
    rating: 4,
    date: "1 week ago",
    content:
      "Very solid experience. The user interface is intuitive and easy to navigate. Lost one star because the initial setup was a little confusing, but customer support was quick to help me through it. Overall, a great product.",
  },
  {
    id: 3,
    name: "Chloe K.",
    rating: 5,
    date: "1 month ago",
    content: "Perfect! Exactly what I was looking for. Five stars!",
  },
  {
    id: 4,
    name: "David M.",
    rating: 3,
    date: "2 weeks ago",
    content:
      "It's okay. The main feature works as described, but I feel like the documentation could be much better. It's a decent product for the price point, but don't expect premium features.",
  },
  {
    id: 5,
    name: "Emily W.",
    rating: 5,
    date: "5 days ago",
    content:
      "A game changer! This has saved me so much time. The quality is exceptional, and I've already recommended it to several colleagues. Seriously, if you're on the fence, just buy it.",
  },
  {
    id: 6,
    name: "Frank L.",
    rating: 4,
    date: "3 weeks ago",
    content:
      "Great value. The design is sleek, and it performs well under load. The only small downside is the limited color options. Otherwise, no complaints.",
  },
  {
    id: 7,
    name: "Grace H.",
    rating: 5,
    date: "4 hours ago",
    content:
      "Fast shipping and a high-quality product. Couldn't ask for more. This short review says it all!",
  },
  {
    id: 8,
    name: "Henry P.",
    rating: 4,
    date: "3 days ago",
    content:
      "Almost perfect. The long battery life is a huge plus, but the charging cable is a bit too short for my liking. Happy with the purchase overall.",
  },
];

const RatingStars = ({ rating }: RatingStarsProps) => {
  const maxRating = 5;
  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${
            index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: ReviewCardProps) => (
  <div className="review-card p-4 bg-white rounded-lg shadow-md border border-gray-100 mb-6 break-inside-avoid">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-lg font-semibold text-gray-800">{review.name}</h3>
      <span className="text-xs text-gray-500">{review.date}</span>
    </div>
    <div className="mb-3">
      <RatingStars rating={review.rating} />
    </div>
    <p className="text-gray-600 leading-relaxed text-xs font-medium">{review.content}</p>
  </div>
);

const UserReview = () => {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 text-gray-900">
        Customer Reviews
      </h2>
      <div
        className="masonry-grid px-2"
        style={{
          columns: "18rem auto",
          gap: "24px",
        }}
      >
        {dummyReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};

export default UserReview;
