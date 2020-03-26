class Controller {
  constructor(videoElement) {
    this.video = videoElement;

    this.subscribe = this.subscribe.bind(this);
    this.removeDefaultControls = this.removeDefaultControls.bind(this);
    this.togglePlayPause = this.togglePlayPause.bind(this);
    this.togglePlayPauseOnClick = this.togglePlayPauseOnClick.bind(this);
    this.offsetCurrentTime = this.offsetCurrentTime.bind(this);
  }

  get duration() {
    return this.video.duration;
  }

  get paused() {
    return this.video.paused;
  }

  get ended() {
    return this.video.ended;
  }

  get playbackRate() {
    return this.video.playbackRate;
  }

  set playbackRate(playbackRate) {
    this.video.playbackRate = playbackRate;
  }

  get currentTime() {
    return this.video.currentTime;
  }

  set currentTime(time) {
    this.video.currentTime = time;
  }

  get volume() {
    return this.video.volume;
  }

  set volume(volume) {
    this.video.volume = volume;
  }

  subscribe(eventNames, callback) {
    eventNames.forEach((eventName) =>
      this.video.addEventListener(eventName, callback)
    );
  }

  removeDefaultControls() {
    this.video.controls = false;
  }

  togglePlayPause() {
    if (this.video.paused || this.video.ended) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  togglePlayPauseOnClick() {
    this.video.addEventListener('click', this.togglePlayPause);
  }

  offsetCurrentTime(amount) {
    this.video.currentTime += amount;
  }
}

const progressBar = (videoController) => {
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.value = 0;
  slider.step = 0.01;
  slider.classList.add('progress-bar');
  slider.setAttribute('aria-label', 'progress bar');

  const setMax = () => {
    if (!slider.max) {
      slider.max = videoController.duration;
    }
  };

  videoController.subscribe(['timeupdate'], () => {
    setMax();
    slider.value = videoController.currentTime;
    slider.style.backgroundImage = `-webkit-gradient(linear, left top, right top, 
      color-stop(${slider.value / slider.max}, #ffc600), 
      color-stop(${slider.value / slider.max}, rgba(0, 0, 0, 0))`;
  });

  videoController.subscribe(['durationchange'], setMax);

  slider.addEventListener('input', (e) => {
    videoController.currentTime = e.target.value;
  });

  return slider;
};

const playPauseButton = (videoController) => {
  const button = document.createElement('button');
  const icon = document.createElement('i');
  icon.classList.add('fa');
  button.appendChild(icon);

  const setText = () => {
    if (videoController.paused || videoController.ended) {
      icon.classList.add('fa-play');
      icon.classList.remove('fa-pause');
      button.setAttribute('aria-label', 'play video');
    } else {
      icon.classList.add('fa-pause');
      icon.classList.remove('fa-play');
      button.setAttribute('aria-label', 'pause video');
    }
  };
  setText();

  button.addEventListener('click', videoController.togglePlayPause);
  videoController.subscribe(['ended', 'pause', 'play'], setText);

  return button;
};

const volume = (videoController) => {
  const container = document.createElement('div');
  container.classList.add('volume');

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 10;
  slider.value = videoController.volume * 10;
  slider.setAttribute('aria-label', 'adjust volume');

  const icon = document.createElement('i');
  icon.classList.add('fa', 'fa-volume-up');

  const setIcon = (vol) => {
    const numericVolume = Number(vol);
    const currentIcon = [...icon.classList].find((cls) =>
      /^fa-volume-\w+$/.test(cls)
    );

    let newIcon = 'fa-volume-down';
    if (numericVolume === 0) {
      newIcon = 'fa-volume-off';
    } else if (numericVolume > 5) {
      newIcon = 'fa-volume-up';
    }

    if (newIcon !== currentIcon) {
      icon.classList.replace(currentIcon, newIcon);
    }
  };

  slider.addEventListener('input', (e) => {
    videoController.volume = e.target.value / 10;
    setIcon(e.target.value);
  });

  container.append(icon, slider);

  return container;
};

const playbackSpeed = (videoController) => {
  const playbackRates = [0.25, 0.5, 1, 2, 3];
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = playbackRates.length - 1;
  slider.setAttribute('aria-label', 'adjust playback rate');

  slider.value = playbackRates.indexOf(1);
  videoController.playbackRate = 1;

  slider.addEventListener('input', (e) => {
    videoController.playbackRate = playbackRates[e.target.value];
  });

  return slider;
};

const skipBackwardButton = (videoController) => {
  const amountToSkip = -10;
  const button = document.createElement('button');
  button.classList.add('skip');
  const icon = document.createElement('i');
  icon.classList.add('fa', 'fa-backward');
  icon.setAttribute('aria-label', 'skip backward');

  const suffixText = document.createTextNode(` ${Math.abs(amountToSkip)}s`);

  button.append(icon, suffixText);

  button.addEventListener('click', () =>
    videoController.offsetCurrentTime(amountToSkip)
  );

  return button;
};

const skipForwardButton = (videoController) => {
  const amountToSkip = 25;
  const button = document.createElement('button');
  button.classList.add('skip');
  const icon = document.createElement('i');
  icon.classList.add('fa', 'fa-forward');
  icon.setAttribute('aria-label', 'skip forward');

  const prefixText = document.createTextNode(`${amountToSkip}s `);

  button.append(prefixText, icon);

  button.addEventListener('click', () =>
    videoController.offsetCurrentTime(amountToSkip)
  );

  return button;
};

const buildControls = (videoController) => {
  const container = document.createElement('ul');
  const controls = [
    progressBar,
    playPauseButton,
    volume,
    playbackSpeed,
    skipBackwardButton,
    skipForwardButton,
  ].map((func) => {
    const li = document.createElement('li');
    li.appendChild(func(videoController));
    return li;
  });
  container.append(...controls);
  container.classList.add('controls');
  return container;
};

const withCustomControls = (videoElement) => {
  const supportsVideo = document.createElement('video').canPlayType;
  if (!supportsVideo) return videoElement;

  const controller = new Controller(videoElement);
  controller.removeDefaultControls();
  controller.togglePlayPauseOnClick();

  const container = document.createElement('div');
  container.setAttribute(
    'style',
    `width: ${videoElement.width}px; height: ${videoElement.height}px`
  );

  const controls = buildControls(controller);

  container.append(videoElement, controls);
  container.classList.add('video-container');
  return container;
};

const video = document.getElementById('video');
const wrappedVideo = withCustomControls(video);

const { body } = document;
body.prepend(wrappedVideo);
