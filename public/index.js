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

  videoController.subscribe(['timeupdate'], () => {
    if (!slider.max) {
      slider.max = videoController.duration;
    }
    slider.value = videoController.currentTime;
  });

  slider.addEventListener('input', (e) => {
    videoController.currentTime = e.target.value;
  });

  return slider;
};

const playPauseButton = (videoController) => {
  const button = document.createElement('button');
  const setText = () => {
    if (videoController.paused || videoController.ended) {
      button.textContent = '▶️';
    } else {
      button.textContent = '⏸️';
    }
  };
  setText();

  button.addEventListener('click', videoController.togglePlayPause);
  videoController.subscribe(['ended', 'pause', 'play'], setText);

  return button;
};

const volume = (videoController) => {
  const container = document.createDocumentFragment();
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 10;
  slider.value = videoController.volume * 10;

  slider.addEventListener('input', (e) => {
    videoController.volume = e.target.value / 10;
  });

  container.textContent = '🔈';
  container.appendChild(slider);

  return container;
};

const playbackSpeed = (videoController) => {
  const playbackRates = [0.25, 0.5, 1, 2, 3];
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = playbackRates.length - 1;

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
  button.textContent = `⏪ ${Math.abs(amountToSkip)}s`;

  button.addEventListener('click', () =>
    videoController.offsetCurrentTime(amountToSkip)
  );

  return button;
};

const skipForwardButton = (videoController) => {
  const amountToSkip = 25;
  const button = document.createElement('button');
  button.textContent = `${amountToSkip}s ⏩`;

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
  return container;
};

const withCustomControls = (videoElement) => {
  const supportsVideo = document.createElement('video').canPlayType;
  if (!supportsVideo) return videoElement;

  const controller = new Controller(videoElement);
  controller.removeDefaultControls();
  controller.togglePlayPauseOnClick();

  const container = document.createElement('div');
  container.setAttribute('width', videoElement.width);
  container.setAttribute('height', videoElement.height);

  const controls = buildControls(controller);

  container.append(videoElement, controls);
  return container;
};

const video = document.getElementById('video');
const wrappedVideo = withCustomControls(video);

const { body } = document;
body.prepend(wrappedVideo);
