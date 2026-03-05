import { Component, ElementRef, viewChild } from '@angular/core';
import { MainPanel } from '../main-panel/main-panel';
import { AboutMexicoPanel } from '../about-mexico-panel/about-mexico-panel';
import { AboutmePanel } from '../aboutme-panel/aboutme-panel';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { DestinationsPanel } from '../destinations-panel/destinations-panel';
import { UserExperiencesPanel } from '../user-experiences-panel/user-experiences-panel';

@Component({
  selector: 'app-main-view',
  imports: [
    MainPanel,
    AboutMexicoPanel,
    AboutmePanel,
    Footer,
    Header,
    DestinationsPanel,
    UserExperiencesPanel,
  ],
  templateUrl: './main-view.html',
  styleUrl: './main-view.scss',
})
export class MainView {
  formSection = viewChild<ElementRef<HTMLElement>>('formSection');

  
  scrollToForm() {
    this.formSection()?.nativeElement.scrollTo();
  }
}
