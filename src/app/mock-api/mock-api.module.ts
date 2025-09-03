import { NgModule } from '@angular/core';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';

@NgModule({
  imports: [
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
      delay: 400,
      passThruUnknownUrl: true,
      apiBase: '/api',
    }),
  ],
})
export class MockApiModule {}
