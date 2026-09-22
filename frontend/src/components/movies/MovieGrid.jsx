import MovieCard from './MovieCard'

export default function MovieGrid({ movies, selectedSlug, onSelect }) {
  return (
    <div className="movie-cards">
      {movies.map((movie) => (
        <MovieCard key={movie.slug} movie={movie} selected={movie.slug === selectedSlug} onSelect={onSelect} />
      ))}
    </div>
  )
}
