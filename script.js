import { vertexShader, fragmentShader } from "./shaders.js";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin);

const lenis = new Lenis({touchMultiplier: 0});
function raf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
lenis.on("scroll", ScrollTrigger.update);

const CONFIG = {
    color: "#f8f4e9",
    spread: 0.10,
    speed: 1.0,
};

const canvas = document.querySelector(".hero-canvas");
const hero = document.querySelector(".hero");

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
});

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        }
    : { r:0.89, g:0.89, b:0.89 };
}

function resize() {
    const width = hero.offsetWidth;
    const height = hero.offsetHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

resize();
window.addEventListener("resize", resize);

const rgb = hexToRgb(CONFIG.color);
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uProgress: { value: 0},
        uResolution: {
            value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight),
        },
        uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
        uSpread: { value: CONFIG.spread },
    },
    transparent: true,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let scrollProgress = 0;

function animate() {
    material.uniforms.uProgress.value = scrollProgress;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

lenis.on("scroll", ({ scroll }) => {
    const heroHeight = hero.offsetHeight;
    const windowHeight = window.innerHeight;
    const maxScroll = heroHeight - windowHeight;
    scrollProgress = Math.min((scroll/maxScroll) * CONFIG.speed, 1.1);
});

window.addEventListener("resize", () => {
    material.uniforms.uResolution.value.set(hero.offsetWidth, hero.offsetHeight);
});

// if you wish to add multiple images in the hero section that transition in a slideshow
let slideIndex = 0;

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("hero-img");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}
  slides[slideIndex-1].style.display = "block";  
  setTimeout(showSlides, 5000);
}

showSlides();

// smooth scroll effect to any links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const target = this.getAttribute('href');
    
    gsap.to(window, {
      duration: 1.5, 
      scrollTo: target, 
      ease: "power2.out"
    });
  });
});

const heroH2 = document.querySelector(".hero-content h2");
// this is to fix the way the text flashes upon reloading the page
// when it should not be visible, offset. do not remove
heroH2.style.visibility = 'visible';
const split = new SplitText(heroH2, { type: "words" });
const words = split.words;

gsap.set(words, { opacity: 0 });

ScrollTrigger.create({
    trigger:".hero-content",
    start:"top 25%",
    end:"bottom 100%",
    onUpdate: (self) => {
        const progress = self.progress;
        const totalWords = words.length;

        words.forEach((word, index) => {
            const wordProgress = index / totalWords;
            const nextWordProgress = (index + 1) / totalWords;

            let opacity = 0;

            if (progress >= nextWordProgress){
                opacity = 1;
            } else if (progress >= wordProgress){
                const fadeProgress = (progress-wordProgress)/(nextWordProgress-wordProgress);
                opacity = fadeProgress;
            }

            gsap.to(word, {
                opacity: opacity,
                duration:0.1,
                overwrite:true,
            });
        });
    },
});


// Food image carousel
const track = document.querySelector(".track");
const carousel = document.querySelector(".carousel");

const getLoopWidth = () => {
  return track.scrollWidth / 2;
};

const loop = gsap.to(track, {
  x: () => -getLoopWidth(),
  duration: 50, 
  ease: "none",
  repeat: -1,
  modifiers: {
    x: gsap.utils.unitize(x => parseFloat(x) % getLoopWidth())
  }
});

carousel.addEventListener("mouseenter", () => {
  gsap.to(loop, { timeScale: 0, duration: 0.8, ease: "power1.out" });
});

carousel.addEventListener("mouseleave", () => {
  gsap.to(loop, { timeScale: 1, duration: 0.8, ease: "power1.in" });
});