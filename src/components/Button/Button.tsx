import React, { useState } from 'react';
import { useSliderContext } from '../../core/useSliderContext';
import { useSound } from '../../hooks/useSound';
import classNames from 'classnames';

interface ButtonProps {
  navigation?: 'forward' | 'back';
  animate?: boolean;
  href?: string;
  flat?: boolean;
  outline?: boolean;
  bezel?: boolean;
  pill?: boolean;
  primary?: boolean;
  secondary?: boolean;
  transparent?: boolean;
  disabled?: boolean;
  disposable?: boolean;
  addContainer?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  onTouchStart?: React.TouchEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  children: React.ReactNode;
}

export function Button({
  navigation,
  animate,
  href,
  flat,
  outline,
  bezel,
  pill,
  primary,
  secondary,
  transparent,
  disabled,
  disposable,
  onClick,
  children,
  addContainer = false,
  ...rest
}: ButtonProps) {
  const { sliderSettings } = useSliderContext();

  // Initializes the hook if there's a file to play
  const [playForwardSound] = useSound({
    sound: sliderSettings.sounds?.button?.forward || '',
    volume: 1,
    interrupt: false
  });
  const [playBackSound, soundBackPlaying] = useSound({
    sound: sliderSettings.sounds?.button?.back || '',
    volume: 0.7,
    interrupt: false
  });

  const [rippleAnimationStyle, setRippleAnimationStyle] = useState({});
  const [ripple, setRipple] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const backHandleClick = () => {
    window.history.back();
  };

  const rippleHandleClick = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    const buttonElement = event.currentTarget;
    const buttonElementRec = buttonElement.getBoundingClientRect();

    const x = event.pageX - buttonElementRec.left - window.scrollX;
    const y = event.pageY - buttonElementRec.top - window.scrollY;

    const diameter = Math.max(
      buttonElement.clientWidth,
      buttonElement.clientHeight
    );

    // If the button is not transparent, show the ripple effect
    if (!transparent) {
      setRippleAnimationStyle({
        top: `${y - diameter / 2}px`,
        left: `${x - diameter / 2}px`,
        width: `${diameter}px`,
        height: `${diameter}px`
      });
      setRipple(true);

      setTimeout(() => {
        setRippleAnimationStyle({});
        setRipple(false);
      }, 500);
    }

    if (onClick) {
      onClick(event);
    }

    setIsButtonClicked(false);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    rippleHandleClick(event);

    if (navigation === 'forward') {
      // Play sound
      if (sliderSettings.soundOn) {
        playForwardSound();
      }
    } else if (navigation === 'back') {
      if (sliderSettings.soundOn) {
        // Play sound
        if (!soundBackPlaying) {
          playBackSound();
        }
      }
      backHandleClick();
    }
  };

  const buttonAnimationStyle = animate
    ? {
        transform: animate && isButtonClicked ? 'scale(0.96)' : 'scale(1)', // Apply styles based on button click status
        transition: 'transform 0.3s'
      }
    : {};

  const buttonTypeClass = classNames({
    'slider__button-flat': flat,
    'slider__button-outline': outline,
    'slider__button-bezel': bezel
  });

  // Determine the state of the button
  const buttonStateClass = classNames({
    'slider__button-primary': primary,
    'slider__button-secondary': secondary,
    'slider__button-transparent': transparent,
    'slider__button-pill': pill,
    'slider__button-disabled': disabled,
    'slider__button-disposable': disposable,
    'slider__button-back': navigation === 'back',
    'slider__button-forward': navigation === 'forward'
  });

  const classnames = classNames(buttonTypeClass, buttonStateClass);

  const renderButton = () => (
    <button
      type="button"
      className={classnames}
      disabled={disabled}
      onClick={handleClick}
      onPointerDown={() => setIsButtonClicked(true)} // Update state on Pointer down
      onPointerUp={() => setIsButtonClicked(false)} // Update state on Pointer up
      onPointerLeave={() => setIsButtonClicked(false)} // Update state on Pointer leave
      style={buttonAnimationStyle}
      {...rest}>
      <span>{children || 'Continue'}</span>
      <span
        className={`slider__ripple ${ripple ? 'slider__ripple-active' : ''}`}
        style={rippleAnimationStyle}
      />
    </button>
  );

  return addContainer ? (
    <div className="slider__buttonContainer">
      <div>{renderButton()}</div>
    </div>
  ) : (
    renderButton()
  );
}
