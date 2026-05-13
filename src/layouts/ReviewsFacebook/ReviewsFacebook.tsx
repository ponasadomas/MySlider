import React, { useState, useEffect, useRef } from 'react';

import { Button } from '../../components/Button/Button';
import { ResponsiveImageOutput } from '../../components/ResponsiveImageOutput/ResponsiveImageOutput';
import { useSliderContext } from '../../core/useSliderContext';

import {
  SlideType_ReviewsFacebook,
  SlideType_ReviewItem
} from '../../types';
import { useHandleAnswer } from '../../hooks/useHandleAnswer';

interface ReviewsFacebookSlideProps {
  slideContents: SlideType_ReviewsFacebook;
}

export function ReviewsFacebookSlide({
  slideContents
}: ReviewsFacebookSlideProps) {
  if (!slideContents) {
    console.warn('No slideContents provided to SingleChoiceSlide component');
    return null;
  }
  const { sliderSettings } = useSliderContext();

  const reviewsColumns = useRef<HTMLDivElement | null>(null);
  const initialCount = slideContents.initialCount ?? 16;
  const loadMoreCount = slideContents.loadMoreCount ?? 4;

  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [columnCount, setColumnCount] = useState(1);
  const [reviews, setReviews] = useState(
    slideContents.reviews.slice(0, visibleCount)
  );

  const handleShowMore = () => setVisibleCount((prev) => prev + loadMoreCount);

  const handleAnswer = useHandleAnswer();
  const handleButtonClick = () => {
    handleAnswer(slideContents.slug, 'null');
  };

  function sortReviews(array: SlideType_ReviewItem[], columns: number) {
    let _cols = columns;
    let _bricks = array;
    let _out: SlideType_ReviewItem[] = [];
    let _col = 0;

    while (_col < _cols) {
      for (let i = 0; i < _bricks.length; i += _cols) {
        let _val = _bricks[i + _col];

        if (_val !== undefined) _out.push(_val);
      }
      _col++;
    }

    return _out;
  }

  function handleResize() {
    if (reviewsColumns.current === null) return;

    const newColumnCount = Number(
      window
        .getComputedStyle(reviewsColumns.current)
        .getPropertyValue('column-count')
    ); // Assuming each column should be 300px wide
    setColumnCount(newColumnCount);
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial column count based on current window size

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setReviews(slideContents.reviews.slice(0, visibleCount));
  }, [visibleCount]);

  return (
    <div className="slider__reviewsFacebook">
      <div className="slider__slide-content">
        <section className="slider__section">
          {slideContents.subtext?.position === 'top' && (
            <p
              className="slider__subtext-top"
              dangerouslySetInnerHTML={{
                __html: slideContents.subtext.text
              }}></p>
          )}
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.headline }}></h2>
          {slideContents.subtext?.position === 'bottom' && (
            <p
              className="slider__subtext-bottom"
              dangerouslySetInnerHTML={{
                __html: slideContents.subtext.text
              }}></p>
          )}
          {slideContents.copyHtml && (
            <div
              className="slider__copyBlock"
              dangerouslySetInnerHTML={{
                __html: slideContents.copyHtml
              }}></div>
          )}
        </section>
        <aside className="slider__reviewsFacebook-container">
          <div className="slider__reviewsFacebook-columns" ref={reviewsColumns}>
            {sortReviews(reviews, columnCount).map(
              (review: SlideType_ReviewItem, index) => (
                <div
                  key={index}
                  className="slider__reviewsFacebook-reviewContainer">
                  <div className="slider__reviewsFacebook-review">
                    <header>
                      {review.image && (
                        <ResponsiveImageOutput
                          png={review.image.png}
                          webp={review.image.webp}
                          sizes={review.image.sizes}
                          alt={review.name}
                        />
                      )}
                      <aside>
                        <strong>{review.name}</strong>
                        <em>
                          {review.profession}
                          <span className={review.country}></span>
                        </em>
                      </aside>
                    </header>
                    <p>“{review.review}”</p>
                    <div className="slider__reviewsFacebook-reactions">
                      {review.reactions?.like && <img src={slideContents.reactionIcons.like} />}
                      {review.reactions?.love && <img src={slideContents.reactionIcons.heart} />}
                      {review.reactions?.wow && <img src={slideContents.reactionIcons.wow} />}
                      {review.reactions?.care && <img src={slideContents.reactionIcons.care} />}
                      {review.reactions?.number && (
                        <span>{review.reactions.number}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          {slideContents.reviews.length - visibleCount > 0 && (
            <Button pill outline onClick={handleShowMore}>
              See more reviews ({slideContents.reviews.length - visibleCount})
            </Button>
          )}
          <Button
            primary
            flat
            navigation="forward"
            animate={sliderSettings.buttonAnimation}
            addContainer
            onClick={() => handleButtonClick()}>
            {slideContents.buttonText ?? 'Continue'}
          </Button>
        </aside>
      </div>
    </div>
  );
}
