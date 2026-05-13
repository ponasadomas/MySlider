import React from 'react';
import { RankerRadioButton } from './RankerRadioButton';
import { SlideType_SingleChoiceRanker } from '../../types';

interface SingleChoiceRankerSlideProps {
  slideContents: SlideType_SingleChoiceRanker;
}

export function SingleChoiceRankerSlide({
  slideContents
}: SingleChoiceRankerSlideProps) {
  if (!slideContents) {
    console.warn(
      'No slideContents provided to SingleChoiceRankerSlide component'
    );
    return null;
  }

  const renderRadioButtons = Array.from(
    { length: slideContents.answerScaleLength },
    (_, index) => {
      const radioValue = slideContents.reverseValue
        ? slideContents.answerScaleLength - index
        : index + 1;
      const answerData = {
        id: `${slideContents.slug}-${radioValue}`,
        slideSlug: slideContents.slug,
        value: radioValue.toString()
      };

      return (
        <li key={index}>
          <RankerRadioButton answerData={answerData} />
        </li>
      );
    }
  );

  return (
    <div className="slider__singleChoiceRankerSlide">
      <div className="slider__slide-content">
        <section className="slider__section">
          <h2 dangerouslySetInnerHTML={{ __html: slideContents.question }}></h2>
          <div className="slider__singleChoiceRankerSlide-answers">
            <div className="slider__singleChoiceRankerSlide-answersHolder">
              <strong
                dangerouslySetInnerHTML={{
                  __html: slideContents.answerScaleLabels.low
                }}></strong>
              <ul>{renderRadioButtons}</ul>
              <strong
                dangerouslySetInnerHTML={{
                  __html: slideContents.answerScaleLabels.high
                }}></strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
