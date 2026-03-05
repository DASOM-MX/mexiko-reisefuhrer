import { Component, signal, OnDestroy, afterNextRender } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-about-mexico-panel',
  imports: [],
  templateUrl: './about-mexico-panel.html',
  styleUrl: './about-mexico-panel.scss',
})
export class AboutMexicoPanel implements OnDestroy {
  private citySubscription?: Subscription;
  private destinationsSubscription?: Subscription;

  readonly citiesArray = [
    'Berlin',
    'Hamburg',
    'Munich',
    'Cologne',
    'Frankfurt',
    'Stuttgart',
  ];

  readonly destinationsArray = [
    'Teotihuacan',
    'Basilica of Guadalupe',
    'Palacio de Bellas Artes',
    'Chapultepec Park',
    'National Museum of Anthropology',
    'Zoumaya Museum',
  ];

  currentCity = signal<string>('Berlin');
  currentDestination = signal<string>('Teotihuacan');

  constructor() {
    afterNextRender(() => {
      this.citySubscription = interval(3000).subscribe(() => {
        const currentIndex = this.citiesArray.indexOf(this.currentCity());
        const nextIndex = (currentIndex + 1) % this.citiesArray.length;
        this.currentCity.set(this.citiesArray[nextIndex]);
      });

      this.destinationsSubscription = interval(3000).subscribe(() => {
        const currentIndex = this.destinationsArray.indexOf(
          this.currentDestination()
        );
        const nextIndex = (currentIndex + 1) % this.destinationsArray.length;
        this.currentDestination.set(this.destinationsArray[nextIndex]);
      });
    });
  }

  ngOnDestroy(): void {
    this.citySubscription?.unsubscribe();
    this.destinationsSubscription?.unsubscribe();
  }
}
