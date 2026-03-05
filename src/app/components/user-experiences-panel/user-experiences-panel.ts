import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  rating: number;
}

interface Stat {
  id: number;
  value: string;
  label: string;
}

@Component({
  selector: 'app-user-experiences-panel',
  imports: [CommonModule],
  templateUrl: './user-experiences-panel.html',
  styleUrl: './user-experiences-panel.scss',
})
export class UserExperiencesPanel implements OnInit, OnDestroy {
  currentTestimonial = 0;
  private slideInterval: any;
  private readonly SLIDE_DURATION = 7000; // 7 seconds per testimonial

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Anna Schmidt',
      location: 'Berlin',
      text: 'Mexiko hat alle Erwartungen übertroffen. Die Strände sind paradiesisch und die Menschen herzlich.',
      rating: 5
    },
    {
      id: 2,
      name: 'Thomas Müller',
      location: 'München',
      text: 'Die Maya-Ruinen haben mich fasziniert. Eine perfekt organisierte Reise voller Geschichte.',
      rating: 5
    },
    {
      id: 3,
      name: 'Sarah Weber',
      location: 'Hamburg',
      text: 'Von Cancún bis Tulum – jede Destination einzigartig. Die Cenoten sind einfach magisch.',
      rating: 5
    },
    {
      id: 4,
      name: 'Michael Becker',
      location: 'Frankfurt',
      text: 'Die mexikanische Kultur ist so lebendig. Die Feste und Musik sind unvergesslich.',
      rating: 5
    }
  ];

  stats: Stat[] = [
    { id: 1, value: '4.9/5', label: 'Bewertung' },
    { id: 2, value: '2500+', label: 'Reisende' },
    { id: 3, value: '50+', label: 'Ziele' },
    { id: 4, value: '15+', label: 'Jahre' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startSlideshow();
    }
  }

  ngOnDestroy(): void {
    this.stopSlideshow();
  }

  goToSlide(index: number): void {
    this.currentTestimonial = index;
    this.resetSlideshow();
  }

  private startSlideshow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.SLIDE_DURATION);
  }

  private stopSlideshow(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  private resetSlideshow(): void {
    this.stopSlideshow();
    if (isPlatformBrowser(this.platformId)) {
      this.startSlideshow();
    }
  }

  private nextSlide(): void {
    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
  }
}
