// Per-layout exports so consumers can import only what they register in their
// funnel:
//
//   import { SingleChoiceSlide, EmailSlide, CtaSlide } from 'myslider/layouts';
//
// Tree-shaking removes anything not imported.

export { SingleChoiceSlide } from './layouts/SingleChoiceSlide/SingleChoiceSlide';
export { SingleChoicePictureSlide } from './layouts/SingleChoicePictureSlide/SingleChoicePictureSlide';
export { SingleChoiceRankerSlide } from './layouts/SingleChoiceRankerSlide/SingleChoiceRankerSlide';
export { MultipleChoiceSlide } from './layouts/MultipleChoiceSlide/MultipleChoiceSlide';
export { MultipleChoicePictureSlide } from './layouts/MultipleChoicePictureSlide/MultipleChoicePictureSlide';
export { OpenEndedQuestionSlide } from './layouts/OpenEndedQuestionSlide/OpenEndedQuestionSlide';
export { TextInputSlide } from './layouts/TextInputSlide/TextInputSlide';
export { CopyBlockSlide } from './layouts/CopyBlockSlide/CopyBlockSlide';
export { ReportSlide } from './layouts/ReportSlide/ReportSlide';
export { HeadlineBlockSlide } from './layouts/HeadlineBlockSlide/HeadlineBlockSlide';
export { EmailSlide } from './layouts/EmailSlide/EmailSlide';
export { PhoneNumberSlide } from './layouts/PhoneNumberSlide/PhoneNumberSlide';
export { BreatherSlide } from './layouts/BreatherSlide/BreatherSlide';
export { BreatherLotusSlide } from './layouts/BreatherLotusSlide/BreatherLotusSlide';
export { CalculatingSlide } from './layouts/CalculatingSlide/CalculatingSlide';
export { LoadingSlide } from './layouts/LoadingSlide/LoadingSlide';
export { TrialPriceSlide } from './layouts/TrialPriceSlide/TrialPriceSlide';
export { ReviewsFacebookSlide } from './layouts/ReviewsFacebook/ReviewsFacebook';
export { CtaSlide } from './layouts/CtaSlide/CtaSlide';
export { AudioPlayer } from './layouts/AudioPlayer/AudioPlayer';
export { BirthDaySlide } from './layouts/BirthDaySlide/BirthDaySlide';
