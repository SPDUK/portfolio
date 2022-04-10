import anime from 'animejs'

export const animateHero = () => {
  anime
    .timeline({
      targets: '.hero__box--05',
    })
    .add({
      duration: 400,
      easing: 'easeInOutExpo',
      scaleX: [0.05, 0.05],
      scaleY: [0, 1],
      perspective: '500px',
      delay: anime.random(0, 400),
    })
    .add({
      duration: 400,
      easing: 'easeInOutExpo',
      scaleX: 1,
    })
    .add({
      duration: 800,
      rotateY: '-15deg',
      rotateX: '8deg',
      rotateZ: '-1deg',
    })

  anime
    .timeline({
      targets: '.hero__box--06, .hero__box--07',
    })
    .add({
      duration: 400,
      easing: 'easeInOutExpo',
      scaleX: [0.05, 0.05],
      scaleY: [0, 1],
      perspective: '500px',
      delay: anime.random(0, 400),
    })
    .add({
      duration: 400,
      easing: 'easeInOutExpo',
      scaleX: 1,
    })
    .add({
      duration: 800,
      rotateZ: '20deg',
    })

  anime({
    targets:
      '.hero__box--01, .hero__box--02, .hero__box--03, .hero__box--04, .hero__box--08, .hero__box--09, .hero__box--10',
    duration: anime.random(600, 800),
    delay: anime.random(600, 800),
    rotate: [
      anime.random(-360, 360),
      (el: HTMLDivElement) => el.getAttribute('data-rotation'),
    ],
    scale: [0.7, 1],
    opacity: [0, 1],
    easing: 'easeInOutExpo',
  })
}
