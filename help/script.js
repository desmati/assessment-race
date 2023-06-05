gsap.registerPlugin(ScrollTrigger);
let tl = gsap.timeline();
tl.fromTo(
  ".content",
  { yPercent: 10, scale: 0.2 },
  {
    opacity: 1,
    yPercent: 0,
    scale: 1,
    scrollTrigger: {
      trigger: ".second",
      start: "top center",
      end: "center 50%",

      scrub: true,
    },
  }
)
  .fromTo(
    ".amin",
    { xPercent: -100, scale: 0.6, opacity: 0 },
    {
      opacity: 1,
      xPercent: 0,
      scale: 1,
      scrollTrigger: {
        trigger: ".third ",
        start: "top center",
        end: "center 50%",

        scrub: true,
      },
    }
  )
  .fromTo(
    ".amin2",
    { xPercent: 100, scale: 0.2, opacity: 0, duration: 1 },
    {
      opacity: 1,
      xPercent: 0,
      scale: 1,
      scrollTrigger: {
        trigger: ".fourth ",
        start: "top bottom",
        end: "center 50%",

        scrub: true,
      },
    }
  );

//
gsap.utils.toArray(".layer").forEach((layer, i) => {
  ScrollTrigger.create({
    trigger: layer,
    start: "top top",
    pin: true,
    pinSpacing: false,
  });
});
//

// Create a new timeline
const tl2 = gsap.timeline();
const group = document.querySelectorAll("#Aria, #Amin ,#Regan,#Ila,#Hossein");

tl2
  .set(group, { opacity: 0, scale: 0 })
  .to(group, {
    stagger: {
      each: 0.6,
    },
    scale: 1,
    opacity: 1,
  })
  .fromTo('.first h2',{

    scale:0.5,
    opacity:0
  },{
    x:50,
    y:-150,
    scale:1,
    duration:3,
    opacity:1
  })



