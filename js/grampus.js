(function () {
  var myImages,
    clouds = document.getElementById('clouds'),
    audio = document.getElementById('audio'),
    wrapper = document.getElementById('wrapper'),
    len,
    domRect = document.body.getBoundingClientRect(),
    W = domRect.width,
    H = domRect.height,
    hW = W / 2, // The variable need in order not to do calculations in a loop
    hH = H / 2,
    // The maximum step of the animation. The variable is needed so that moving several layers at once looks smooth.
    // The value is chosen experimentally.
    step = 7,
    flag = false,
    destination_x = hW, // Start position
    destination_y = hH;

  audio.addEventListener('canplay', function () {
    audio.play();
    audio.volume = 0.1;
  });

  function setTranslate(el, x, y) {
    el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
  }

  function getTranslation(obj) {
    if (!getComputedStyle(obj)) {
      return;
    }

    var style = getComputedStyle(obj),
      transform = style.transform,
      translation = transform.match(/^matrix\((.+)\)$/),
      translationArr;

    if (translation) {
      translationArr = translation[1].split(', ');
      return {
        x: ~~translationArr[4],
        y: ~~translationArr[5]
      }
    }

    return {
      x: 0,
      y: 0
    }
  }

  function loadImage(elem, ln, fn) {
    var fragment = document.createDocumentFragment(),
      count = 0,
      img = {},
      onImgLoad = function () {
        this.style.marginLeft = '-' + (this.offsetWidth) / 2 + 'px';
        this.style.marginTop = '-' + (this.offsetHeight) / 2 + 'px';
        setTranslate(this, hW, hH);
        count += 1;
        (count === ln && typeof fn === 'function') ? fn() : null;
      };

    for (var i = 0; i < ln; i += 1) {
      img[i] = new Image();
      img[i].classList.add('layer');
      fragment.appendChild(img[i]);
      img[i].onload = onImgLoad;
      img[i].src = 'img/slide' + (i + 1) + '.png';
    }
    elem.appendChild(fragment);
    myImages = wrapper.querySelectorAll('.layer');
    len = ln;
  }

  function doStep() {
    var dx, dy, tg, current_x, current_y;

    for (var i = 0; i < len; i += 1) {
      // Not top layer
      if (i !== len - 1) {
        current_x = getTranslation(myImages[i + 1]).x; // use coordinates of higher layer
        current_y = getTranslation(myImages[i + 1]).y;

        dx = Math.abs(current_x - destination_x);
        dy = Math.abs(current_y - destination_y);

        if (dx <= step && dy <= step) {
          current_x = destination_x;
          current_y = destination_y;
        }

        setTranslate(myImages[i], current_x, current_y);

        if (i === 0 && destination_x === current_x && destination_y === current_y) { // Stop calculations if the coordinates are the same
          flag = true;
          return;
        }
      } else { // Top layer
        current_x = getTranslation(myImages[i]).x;
        current_y = getTranslation(myImages[i]).y;

        dx = Math.abs(current_x - destination_x); // Absolute value of the difference between coordinates
        dy = Math.abs(current_y - destination_y);
        tg = dx / dy;
        // The factor that regulates the movement of the shortest paths. Analogue of velocity.

        // Iteration of options for moving the mouse to the ratio of the maximum step
        if (dx <= step && dy <= step) {
          current_x = destination_x;
          current_y = destination_y;
        }
        if (dx > step && dy <= step) {
          // Define the coordinate increases or decreases
          current_x += (current_x < destination_x) ? step : -step;
          current_y += (current_y < destination_y) ? step / tg : -step / tg;
        }
        if (dx <= step && dy > step) {
          current_x += (current_x < destination_x) ? step * tg : -step * tg;
          current_y += (current_y < destination_y) ? step : -step;
        }
        if (dx > step && dy > step) {
          if (dx > dy) {
            current_x += (current_x < destination_x) ? step : -step;
            current_y += (current_y < destination_y) ? step / tg : -step / tg;
          } else if (dx < dy) {
            current_x += (current_x < destination_x) ? step * tg : -step * tg;
            current_y += (current_y < destination_y) ? step : -step;
          } else {
            current_x += (current_x < destination_x) ? step : -step;
            current_y += (current_y < destination_y) ? step : -step;
          }
        }

        setTranslate(myImages[i], current_x, current_y);
      }
    }
    // Repeated a function call to complete the movement,
    // it means that all layers should be arranged strictly one above the other
    window.requestAnimationFrame(doStep);
  }

  // Get cursor coordinates after moving
  function animateCharacter(e) {
    window.requestAnimationFrame(function () {
      destination_x = e.pageX;
      destination_y = e.pageY;
      if (flag) {
        flag = false;
        doStep();
      }
    });
  }

  function init() {
    document.body.classList.remove('load');

    // Initiate the animated character
    setTimeout(function () {
      clouds.parentNode.removeChild(clouds);
      doStep();
      document.addEventListener('mousemove', animateCharacter, false);
    }, 14000);
  }

  loadImage(wrapper, 43, init);
})();
