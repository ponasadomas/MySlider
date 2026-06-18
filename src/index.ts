export { SliderProvider } from './core/SliderProvider';
export { Slider } from './core/Slider';
export { useSliderContext } from './core/useSliderContext';

// Advances the slider (records the answer + navigates). Exported so a consuming
// project can build custom slide layouts that drive navigation themselves.
export { useHandleAnswer } from './hooks/useHandleAnswer';

// Loading-screen behaviour, so a consuming project can build its own
// richly-decorated `loadingSlide` component on top of it.
export { useLoadingSequence } from './hooks/useLoadingSequence';

// Shared `userProfile` localStorage identity contract (userUuid + submissionId).
// Exported so analytics / Meta CAPI code can read the same ids MySlider submits.
export {
  getOrMintUserUuid,
  getOrCreateSubmissionUuid,
  rotateSubmissionUuid,
} from './utils/userProfile';
export { uuidV4 } from './utils/uuid';

export type {
  SliderDataTypes,
  SlideTypes,
  SliderSettingsType,
  SliderLogicType,
  SliderMetadataType,
  SliderLayoutsMap,
  SliderLayoutComponent,
  // Per-slide types — exported so consumers can type their sliderData strictly:
  SlideType_SingleChoice,
  SlideType_SingleChoicePicture,
  SlideType_SingleChoiceRanker,
  SlideType_MultipleChoice,
  SlideType_MultipleChoicePicture,
  SlideType_BreatherSlide,
  SlideType_CalculatingSlide,
  SlideType_LoadingSlide,
  SlideType_OpenEndedQuestion,
  SlideType_TextInput,
  SlideType_Email,
  SlideType_ReviewsFacebook,
  SlideType_CopyBlock,
  SlideType_Report,
  SlideType_HeadlineBlock,
  SlideType_PhoneNumber,
  SlideType_CtaSlide,
  SlideType_TrialPrice,
  SlideType_AudioPlayer,
  SlideType_BirthDay,
} from './types';
