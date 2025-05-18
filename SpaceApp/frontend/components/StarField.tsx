import { useEffect, useState } from 'react';

interface StarProps {
  top: string;
  left: string;
  opacity: number;
  animation: string;
}

export function StarField() {
  const [stars, setStars] = useState<Array<StarProps> | null>(null);

  useEffect(() => {
    const generatedStars = Array.from({ length: 100 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random(),
      animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
    }));
    setStars(generatedStars);
  }, []);

  if (!stars) return null;

  return (
    <div className="star-field">
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            opacity: star.opacity,
            animation: star.animation,
          }}
        />
      ))}
    </div>
  );
} 