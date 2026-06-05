import { Component, inject } from '@angular/core';
import { ModeService } from '../mode-service/mode.service';

@Component({
  selector: 'app-mode',
  imports: [],
  templateUrl: './mode.html',
  styleUrl: './mode.css',
})
export class Mode {
  theme = inject(ModeService);
}
