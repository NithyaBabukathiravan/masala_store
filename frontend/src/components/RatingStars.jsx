function RatingStars({ rating }) {
  return (
    <div>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </div>
  );
}

export default RatingStars;