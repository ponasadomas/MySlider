import type React from 'react';

// ---------------------------------------------------------------------------
// Image asset types — consumer-provided. The library never imports images.
// Shape mirrors what bundlers like webpack's responsive-loader or Vite's
// equivalents emit. Consumers can also pass any object/string matching these
// shapes — the library only reads, never resolves.
// ---------------------------------------------------------------------------

type SlideType_Subtext = {
  position: 'top' | 'bottom';
  text: string;
};

type SlideType_Defaults = {
  category: string;
  slug: string;
};

type SlideType_SvgImage = {
  svg: string;
  alt?: string;
  position: 'top' | 'bottom';
};

type SlideType_InlineSvgImage = {
  svg: string;
  alt?: string;
};

type SlideType_ResponsiveImage = {
  png: {
    height: number;
    width: number;
    images: { height: number; width: number; path: string }[];
    src: string;
    srcSet: string;
  };
  webp?: {
    height: number;
    width: number;
    images: { height: number; width: number; path: string }[];
    src: string;
    srcSet: string;
  };
  sizes: string;
  alt?: string;
  lazy?: boolean;
  position: 'top' | 'bottom';
};

type SlideType_InlineResponsiveImage = Omit<SlideType_ResponsiveImage, 'position'>;

type SlideType_FlatResponsiveImage = {
  srcSet: string;
  images: { height: number; width: number; path: string }[];
  src: string;
  width: number;
  height: number;
  sizes: string;
  alt?: string;
  lazy?: boolean;
};

// ---------------------------------------------------------------------------
// Slide types — one per layout
// ---------------------------------------------------------------------------

export type SlideType_SingleChoice = SlideType_Defaults & {
  type: 'singleChoice';
  layout: 'vertical' | 'horizontal';
  question: string;
  subtext?: SlideType_Subtext;
  answers: { text: string; value: string }[];
  image?: SlideType_ResponsiveImage | SlideType_SvgImage;
};

export type SlideType_SingleChoicePicture = SlideType_Defaults & {
  type: 'singleChoicePicture';
  layout: 'vertical' | 'horizontal';
  kicker?: string;
  question: string;
  subtext?: SlideType_Subtext;
  answers: {
    text: string;
    value: string;
    image?: { svg: string; alt?: string } | { inlineSvg: string };
  }[];
  image?: SlideType_ResponsiveImage | SlideType_SvgImage;
};

export type SlideType_MultipleChoice = SlideType_Defaults & {
  type: 'multipleChoice';
  layout: 'vertical' | 'horizontal';
  question: string;
  subtext?: SlideType_Subtext;
  answers: { text: string; value: string }[];
  noneOption?: { text: { desktop: string; mobile: string } };
  buttonText?: string;
  image?: SlideType_ResponsiveImage | SlideType_SvgImage;
};

export type SlideType_MultipleChoicePicture = SlideType_Defaults & {
  type: 'multipleChoicePicture';
  layout: 'vertical' | 'horizontal';
  question: string;
  subtext?: SlideType_Subtext;
  answers: {
    text: string;
    value: string;
    image: { svg: string; alt?: string };
  }[];
  noneOption?: {
    text: { desktop: string; mobile: string };
    image?: { svg: string; alt?: string };
  };
  buttonText?: string;
  image?: SlideType_ResponsiveImage | SlideType_SvgImage;
};

export type SlideType_SingleChoiceRanker = SlideType_Defaults & {
  type: 'singleChoiceRanker';
  question: string;
  answerScaleLabels: { low: string; high: string };
  answerScaleLength: number;
  reverseValue: boolean;
};

export type SlideType_OpenEndedQuestion = SlideType_Defaults & {
  type: 'openEndedQuestion';
  required?: boolean;
  question: string;
  subtext?: SlideType_Subtext;
  placeholder: string;
};

export type SlideType_CopyBlock = SlideType_Defaults & {
  type: 'copyBlock';
  headline: string;
  copyHtml: string;
  copyImages?: (SlideType_InlineResponsiveImage | SlideType_FlatResponsiveImage | SlideType_InlineSvgImage)[];
  buttonText?: string;
  image?: SlideType_ResponsiveImage | SlideType_SvgImage;
};

export type SlideType_Report = SlideType_Defaults & {
  type: 'report';
  headline: string;
  copyHtml: string;
  copyImages?: (SlideType_InlineResponsiveImage | SlideType_FlatResponsiveImage | SlideType_InlineSvgImage)[];
  buttonText?: string;
  image?: SlideType_ResponsiveImage | SlideType_SvgImage;
};

export type SlideType_HeadlineBlock = SlideType_Defaults & {
  type: 'headlineBlock';
  headline: string;
  copyHtml: string;
  buttonText?: string;
};

export type SlideType_Email = SlideType_Defaults & {
  type: 'emailSlide';
  image?: SlideType_ResponsiveImage;
  headline: string;
  subtext?: SlideType_Subtext;
  policyText?: { text: string; position: 'top' | 'bottom' };
  emailMarketingService: {
    listId: number | string;
    apiEndpoint: string;
  };
  buttonText?: string;
};

export type SlideType_PhoneNumber = SlideType_Defaults & {
  type: 'phoneNumber';
  headline: string;
  subtext?: SlideType_Subtext;
  caption?: string;
};

export type SlideType_BreatherSlide = SlideType_Defaults & {
  type: 'breatherLotusSlide' | 'breatherSlide';
  logoLoader: { svgPath: string; viewBox: string };
};

export type SlideType_CalculatingSlide = SlideType_Defaults & {
  type: 'calculatingSlide';
  title: string;
  elements: {
    title: string;
    /** Duration in **seconds** — passed directly to GSAP. e.g. `2` = 2s, `0.5` = 500ms. */
    time: number;
    statusMessages?: {
      waiting?: string;
      active?: string;
      done?: string;
    };
  }[];
};

export type SlideType_ReviewItem = {
  name: string;
  country: 'us' | 'uk' | 'ca' | 'au' | 'nz' | 'ie';
  profession: string;
  image?: SlideType_ResponsiveImage;
  review: string;
  reactions?: {
    number: string;
    like?: boolean;
    love?: boolean;
    wow?: boolean;
    care?: boolean;
  };
};

export type SlideType_ReviewsFacebook = SlideType_Defaults & {
  type: 'reviewsFacebook';
  headline: string;
  subtext?: SlideType_Subtext;
  copyHtml?: string;
  reviews: SlideType_ReviewItem[];
  buttonText?: string;
  initialCount?: number;
  loadMoreCount?: number;
  // v2: reaction icons externalized — consumer provides URLs.
  reactionIcons: { like: string; heart: string; care: string; wow: string };
};

export type SlideType_CtaSlide = SlideType_Defaults & {
  type: 'ctaSlide';
  image: SlideType_ResponsiveImage;
  headline: string;
  copyHtml: string;
  buttons: {
    agree: { text: string; value: string };
    disagree: { text: string; value: string };
  };
};

export type SlideType_TrialPrice = SlideType_Defaults & {
  type: 'trialPrice';
  headline: string;
  subtext?: SlideType_Subtext;
  copyHtml?: string;
  policyText?: string;
  priceOptions: number[];
  confirmation?: { text: string };
};

export type SlideType_AudioPlayer = SlideType_Defaults & {
  type: 'audioPlayer';
  audioFile: string;
};

export type SlideTypes =
  | SlideType_SingleChoice
  | SlideType_SingleChoicePicture
  | SlideType_SingleChoiceRanker
  | SlideType_MultipleChoice
  | SlideType_MultipleChoicePicture
  | SlideType_BreatherSlide
  | SlideType_CalculatingSlide
  | SlideType_OpenEndedQuestion
  | SlideType_Email
  | SlideType_ReviewsFacebook
  | SlideType_CopyBlock
  | SlideType_Report
  | SlideType_HeadlineBlock
  | SlideType_PhoneNumber
  | SlideType_CtaSlide
  | SlideType_TrialPrice
  | SlideType_AudioPlayer;

export type SliderDataTypes = SlideTypes[];

// ---------------------------------------------------------------------------
// Settings / logic / metadata — consumer-provided config
// ---------------------------------------------------------------------------

export type SliderFlowType = string[];
export type CurrentSlideSlugType = string;
export type NextSlideSlugType = string | null;
export type TotalSlidesType = number;
export type RequiredSlideSlugsType = string[];

export type SliderSettingsType = {
  sliderName: string;
  startPath: string;
  userStorageKey: string;
  buttonAnimation?: boolean;
  soundOn: boolean;
  sounds?: {
    button?: { forward: string; back: string };
    radioButton?: { clickDown: string; clickUp: string };
    checkbox?: { checkStart: string; checkOn: string; checkOff: string };
  };
  header: {
    showLogo: false | { svg: string; alt: string };
    showQuestionCategory: boolean;
    /**
     * Render "Question N of Total" text in the header. Pass a function that
     * receives the 1-based slide number + total and returns the rendered
     * node (any markup). i18n is the consumer's responsibility.
     */
    showQuestionCount?: false | ((n: number, total: number) => React.ReactNode);
    /**
     * Render an exit link in the header. `label` accepts any ReactNode so
     * the consumer can include an icon/SVG alongside the text.
     */
    exitLink?: { href: string; label: React.ReactNode };
  };
  footer?: {
    /**
     * Reassurance line (e.g. privacy note) rendered below the footer's
     * back-button row. Accepts any ReactNode so the consumer can pair an
     * icon with the text.
     */
    reassurance?: React.ReactNode;
  };
  navigation: {
    skippingAllowed: boolean;
    slideAnimationDirection:
      | 'vertical'
      | 'horizontal'
      | 'none'
      | 'cosmicBlur'
      | 'veilSweep'
      | 'starDissolve'
      | 'subtleScale';
    type: '#' | '/';
    clickDelay: number;
    progressBar?: { position: 'top' | 'bottom' };
    createRedirectUrlAfterDataSubmit: (result: any) => string;
  };
  structure: {
    totalSlides: TotalSlidesType;
    requiredSlideSlugs: RequiredSlideSlugsType;
  };
  backendSettings: {
    submitDataApi: string;
    receiveDataApi: string;
  };
};

type SlideSlug = string;
type AnswerSlug = string;
type NextSlideSlug = string[];

type FlowByAnswerMap = {
  [questionSlug: SlideSlug]: {
    [answerSlug: AnswerSlug]: NextSlideSlug;
  };
};

export type SliderLogicType = {
  specialSlideTypes: string[];
  initialSlides: string[];
  flowByAnswer: FlowByAnswerMap;
  flowAugmentation: FlowByAnswerMap;
};

export type SliderMetadataType = {
  [key: string]: string | Record<string, string>;
};

export type AnswerHistoryType = {
  [key: string]: string | string[];
};

export type SliderSlideRefType = React.MutableRefObject<(HTMLDivElement | null)[]>;
export type DisableMouseEventsType = boolean;
export type HideUIElementsType = boolean;

export interface SliderAnswersType {
  [key: string]: string | string[];
}

export interface SliderTransitionAnimationSettings {
  width?: number | string;
  paddingBottom?: number | string;
  height?: number | string;
  zIndex?: number;
  overflow?: 'hidden';
  transformOrigin?: 'center';
  transform?: string;
  duration?: number;
  ease?: string;
  delay?: number;
  opacity?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

export type SliderTransitionType = {
  transitionExpanded: boolean;
  transitionCenterPoint: { posTop: number; posLeft: number } | null;
  transitionDataSubmit: boolean;
  sound?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  delay?: number;
  duration?: number;
};

// ---------------------------------------------------------------------------
// Layout registry (v2 addition) — consumer plugs in only what they use.
// Each entry maps a slide.type string to a React component receiving
// `slideContents`. Tree-shaking eliminates unregistered layouts.
// ---------------------------------------------------------------------------

export type SliderLayoutComponent<T extends SlideTypes = SlideTypes> = React.ComponentType<{
  slideContents: T;
}>;

export type SliderLayoutsMap = Partial<{
  [K in SlideTypes['type']]: SliderLayoutComponent<Extract<SlideTypes, { type: K }>>;
}>;

// ---------------------------------------------------------------------------
// Context shape (internal but exported for consumer use if needed)
// ---------------------------------------------------------------------------

export interface SliderContextType {
  sliderData: SliderDataTypes;
  sliderSettings: SliderSettingsType;
  sliderMetadata: SliderMetadataType;
  sliderLogic: SliderLogicType;
  layouts: SliderLayoutsMap;

  currentSlideSlug: CurrentSlideSlugType;
  setCurrentSlideSlug: React.Dispatch<React.SetStateAction<CurrentSlideSlugType>>;
  currentSlideCategory: string;
  setCurrentSlideCategory: React.Dispatch<React.SetStateAction<string>>;

  nextSlideSlug: NextSlideSlugType;
  setNextSlideSlug: React.Dispatch<React.SetStateAction<NextSlideSlugType>>;

  sliderFlow: SliderFlowType;
  setSliderFlow: React.Dispatch<React.SetStateAction<SliderFlowType>>;

  sliderAnswers: SliderAnswersType;
  setSliderAnswers: React.Dispatch<React.SetStateAction<SliderAnswersType>>;

  sliderSlideRef: SliderSlideRefType;

  disableMouseEvents: DisableMouseEventsType;
  setDisableMouseEvents: React.Dispatch<React.SetStateAction<DisableMouseEventsType>>;

  totalSlidesNumber: TotalSlidesType;
  setTotalSlidesNumber: React.Dispatch<React.SetStateAction<TotalSlidesType>>;

  sliderTransition: SliderTransitionType;
  setSliderTransition: React.Dispatch<React.SetStateAction<SliderTransitionType>>;

  hideUIElements: HideUIElementsType;
  setHideUIElements: React.Dispatch<React.SetStateAction<HideUIElementsType>>;
}
