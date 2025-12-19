import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HelpList } from './data';

@Component({
  selector: 'app-help-center',
  imports: [],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HelpCenterComponent {
  title = 'Yardım Merkezi';
  helpList = HelpList;
}