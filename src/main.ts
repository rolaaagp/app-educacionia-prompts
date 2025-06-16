import '@progress/kendo-drawing/pdf';
import { defineFont } from '@progress/kendo-drawing/pdf';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';


if (environment.production) {
  enableProdMode();
  window.console.log = () => {}
}

defineFont({
  'DejaVu': 'assets/fonts/DejaVuSans.ttf'
});
defineFont({
  'DejaVu|Bold': 'assets/fonts/DejaVuSans-Bold.ttf'
});
defineFont({
  'DejaVu|Italic': 'assets/fonts/DejaVuSans-Oblique.ttf'
});
defineFont({
  'DejaVu|Bold|Italic': 'assets/fonts/DejaVuSans-BoldOblique.ttf'
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
