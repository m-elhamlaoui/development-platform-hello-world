export function generateStars(count = 100) {
  const stars = []

  for (let i = 0; i < count; i++) {
    const size = Math.random() < 0.6 ? "small" : Math.random() < 0.9 ? "medium" : "large"

    stars.push({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size,
      opacity: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 3 + 2,
    })
  }

  return stars
}

// Generate a random number between min and max
export function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

// Generate a random color
export function randomColor() {
  return `hsl(${Math.random() * 360}, 50%, 50%)`
}
