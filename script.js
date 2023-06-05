let tl = gsap.timeline();
tl.set(".container", { scale: 0.1 })
  .to(".container", { scale: 1, duration: 3 })
  .from(".container h1", {
    opacity: 0,
    duration: 1.5,
  })
  .from(".demo div", { y: 80, opacity: 0, stagger: 0.5 })
  .to(".demo div", {
    opacity: 0.85,
    stagger: {
      each: 0.1,
      start: "random",
    },
  })
  .to(".demo div", {
    opacity: 0.85,
    stagger: {
      each: 0.5,
      start: "random",
    },

    x: function (index, target) {
      var itemWidth = target.offsetWidth;
      var containerWidth = window.innerWidth;
      var padding = 20;

      var startPosition =
        containerWidth / 2.5 -
        (itemWidth + padding) *
          Math.floor(
            gsap.utils.wrap(
              0,
              containerWidth / (itemWidth + padding) - 1,
              index
            )
          );

      return startPosition + Math.random() * padding;
    },
    rotation: 360,
    color: "#02FF86",
  })
  .to(".demo div", {
    scale: 0,
    stagger: { start: "end", each: 1, opacity: 0 },
  })
  .from(
    ".button-groups a",
    {
      ease: "Bounce.easeIn",
      opacity: 0,
      duration: 3,
      scale: 0,
    },
    "-=2"
  )
