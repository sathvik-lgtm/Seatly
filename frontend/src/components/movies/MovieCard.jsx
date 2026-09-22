export default function MovieCard({ movie, selected, onSelect }) {
  return (
    <div className={`movie-card${selected ? ' selected' : ''}`} onClick={() => onSelect(movie)}>
      <div className="movie-poster">
        <img
          src={movie.poster}
          alt={movie.title}
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = movie.posterFallback
          }}
        />
      </div>
      <div className="movie-info">
        <h4>{movie.title}</h4>
        <p>
          {movie.genre} • {movie.runtime}
        </p>
        <a href={movie.imdbUrl} target="_blank" rel="noopener noreferrer" className="movie-rating">
          <span className="imdb-logo">IMDb</span>
          <span className="rating-score">{movie.rating}</span>
        </a>
      </div>
    </div>
  )
}
