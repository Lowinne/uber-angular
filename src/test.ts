// src/test.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClientTesting(), // ✅ fournit HttpClient + HttpTestingController
      provideRouter([]), // ✅ évite les erreurs de Router/RouterLink
    ],
  });
});
