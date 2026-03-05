import {
  Component,
  OnDestroy,
  HostListener,
  ElementRef,
  Renderer2,
  ViewChild,
  afterNextRender,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface SlideImage {
  url: string;
  alt: string;
}

@Component({
  selector: 'app-main-panel',
  imports: [CommonModule],
  templateUrl: './main-panel.html',
  styleUrl: './main-panel.scss',
})
export class MainPanel implements OnDestroy {
  // View references
  @ViewChild('mainPanelContainer', { static: false }) 
  private mainPanelContainer?: ElementRef<HTMLElement>;

  // Public properties
  currentSlide = 0;

  // Slideshow configuration
  readonly images: SlideImage[] = [
    { url: 'sonne-piramide-1.jpeg', alt: 'Entdecken Sie die Schönheit Mexikos' },
    { url: 'sonne-piramide-2.jpeg', alt: 'Mexikanische Kultur und Tradition' },
    { url: 'sonne-piramide-3.jpeg', alt: 'Paradiesische Strände und Natur' },
    { url: 'sonne-piramide-4.jpeg', alt: 'Historische Stätten und Abenteuer' },
  ];

  // Private properties
  private readonly SLIDE_DURATION = 6000; // 6 seconds per slide
  private readonly PARALLAX_SPEEDS = {
    background: 0.15,
    text: -0.1,
    overlay: 0.12
  } as const;

  private slideInterval?: ReturnType<typeof setInterval>;

  constructor(
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    // Use afterNextRender to ensure code runs only in browser after hydration
    afterNextRender(() => {
      this.initializeBrowserFeatures();
    });
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    requestAnimationFrame(() => this.handleParallax());
  }

  /**
   * Initializes browser-only features after hydration is complete
   */
  private initializeBrowserFeatures(): void {
    // Start slideshow outside Angular zone to prevent blocking stability
    this.ngZone.runOutsideAngular(() => {
      this.startSlideshow();
    });
    
    // Initial parallax calculation
    requestAnimationFrame(() => this.handleParallax());
  }

  /**
   * Handles parallax scrolling effect with different speeds for multiple layers
   */
  private handleParallax(): void {
    const container = this.mainPanelContainer?.nativeElement;
    if (!container) return;

    const scrollPosition = window.pageYOffset;
    const containerRect = container.getBoundingClientRect();
    const containerTop = scrollPosition + containerRect.top;
    const windowHeight = window.innerHeight;

    // Check if container is in viewport
    if (!this.isElementInViewport(scrollPosition, containerTop, containerRect.height, windowHeight)) {
      return;
    }

    const relativeScroll = scrollPosition - containerTop + windowHeight;

    // Apply parallax transforms using Renderer2
    this.applyParallaxToElements('.parallax-bg', relativeScroll * this.PARALLAX_SPEEDS.background);
    this.applyParallaxToElement('.parallax-text', relativeScroll * this.PARALLAX_SPEEDS.text);
    this.applyParallaxToElement('.parallax-overlay', relativeScroll * this.PARALLAX_SPEEDS.overlay);
  }

  /**
   * Checks if element is visible in viewport
   */
  private isElementInViewport(
    scrollPosition: number,
    elementTop: number,
    elementHeight: number,
    windowHeight: number
  ): boolean {
    return scrollPosition + windowHeight > elementTop && 
           scrollPosition < elementTop + elementHeight;
  }

  /**
   * Applies parallax transform to multiple elements
   */
  private applyParallaxToElements(selector: string, offset: number): void {
    const container = this.mainPanelContainer?.nativeElement;
    if (!container) return;

    const elements = container.querySelectorAll<HTMLElement>(selector);
    elements.forEach(element => {
      this.renderer.setStyle(element, 'transform', `translateY(${offset}px)`);
    });
  }

  /**
   * Applies parallax transform to a single element
   */
  private applyParallaxToElement(selector: string, offset: number): void {
    const container = this.mainPanelContainer?.nativeElement;
    if (!container) return;

    const element = container.querySelector<HTMLElement>(selector);
    if (element) {
      this.renderer.setStyle(element, 'transform', `translateY(${offset}px)`);
    }
  }

  /**
   * Starts the automatic slideshow
   */
  private startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.SLIDE_DURATION);
  }

  /**
   * Stops the automatic slideshow
   */
  private stopSlideshow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = undefined;
    }
  }

  /**
   * Advances to the next slide
   */
  private nextSlide(): void {
    // Run change detection inside Angular zone for UI updates
    this.ngZone.run(() => {
      this.currentSlide = (this.currentSlide + 1) % this.images.length;
    });
  }
}
