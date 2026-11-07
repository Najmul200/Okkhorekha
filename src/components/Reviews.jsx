import { useEffect, useState } from 'react';
import api from '../lib/api.js';

export default function Reviews({ projectId, projectTitle }) {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    setMessage('');
    api
      .get(`/reviews/${encodeURIComponent(projectId)}`)
      .then(({ data }) => {
        if (active) setReviews(data);
      })
      .catch(() => {
        if (active) {
          setLoadError(true);
          setMessage('Reviews are temporarily unavailable. Please try again later.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const { data } = await api.post(`/reviews/${encodeURIComponent(projectId)}`, {
        name: name.trim(),
        text: text.trim(),
        rating,
        projectTitle,
      });
      setReviews((current) => [data, ...current]);
      setName('');
      setText('');
      setRating(5);
      setMessage('Thank you. Your review has been published.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Your review could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 max-[700px]:py-14" id="review" aria-labelledby="review-title" data-reveal>
      <div className="mx-auto w-[min(1280px,calc(100%-3rem))] max-[700px]:w-[calc(100%-2rem)] max-[360px]:w-[calc(100%-1.5rem)]">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-black/15 pb-4 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
          <h2 id="review-title" className="font-display text-[2.45rem] font-normal leading-tight max-[700px]:text-3xl">Client Reviews</h2>
          <p className="max-w-xl text-muted">Thoughts from clients connected to {projectTitle}.</p>
        </div>
        <div className="mt-5 rounded-sm border border-neutral-300 bg-white p-6 max-[700px]:p-4" data-reveal>
          <p className="mb-4 text-muted">Share your experience with this project.</p>
          <form id="reviewForm" className="grid gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              id="reviewName"
              name="name"
              className="w-full rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 text-ink outline-none focus:border-black focus:ring-2 focus:ring-black/15"
              placeholder="Your Name"
              aria-label="Your name"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              id="reviewText"
              name="review"
              className="w-full rounded-sm border border-neutral-300 bg-neutral-50 px-4 py-3 text-ink outline-none focus:border-black focus:ring-2 focus:ring-black/15"
              placeholder="Write your review here"
              aria-label="Write your review"
              required
              minLength={8}
              maxLength={1200}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <fieldset className="border-0" id="reviewStars">
              <legend className="mb-1 text-sm text-muted">Rating</legend>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={`inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-2xl transition-transform ${n <= rating ? 'scale-110 text-black' : 'text-neutral-400 hover:scale-110 hover:text-black'}`}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    aria-pressed={rating === n}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-sm border border-black bg-black px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-70" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
          <div id="reviewMessage" className="mt-3 min-h-6 text-sm text-neutral-700" role="status" aria-live="polite">
            {message}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[700px]:grid-cols-1" id="reviewList" aria-live="polite">
          {loading ? (
            <p className="col-span-full text-sm text-muted">Loading reviews…</p>
          ) : loadError ? null : reviews.length === 0 ? (
            <p className="col-span-full text-sm text-muted">No reviews yet. Be the first to share your experience.</p>
          ) : (
            reviews.map((item, index) => (
              <article
                className="min-h-45 min-w-0 wrap-anywhere rounded border border-neutral-200 bg-white p-5 shadow-sm animate-[review-card-enter_500ms_ease_both] max-[700px]:min-h-0"
                key={item._id}
                style={{ animationDelay: `${Math.min(index, 5) * 65}ms` }}
              >
                <div className="text-black" aria-label={`${item.rating} star rating`}>
                  {'★'.repeat(item.rating)}
                </div>
                <blockquote>{item.text}</blockquote>
                <p className="text-sm font-semibold text-muted before:content-['—_']">{item.name}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
