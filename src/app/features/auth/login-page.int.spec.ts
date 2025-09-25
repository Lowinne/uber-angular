import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginPageComponent (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginPageComponent,
        RouterTestingModule,
        HttpClientTestingModule, // ⬅️ le plus robuste
      ],
      providers: [AuthService],
    }).compileComponents();
  });

  it('should render the login form', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toContain('Connexion');
    expect(el.querySelector('form')).toBeTruthy();
  });

  it('should attempt login (HTTP mocked)', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const comp = fixture.componentInstance;
    const httpMock = TestBed.inject(HttpTestingController);

    comp.form.setValue({ email: 'alice@demo.com', password: 'demo123' });
    const promise = comp.onSubmit(); // déclenche POST /api/auth/login

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'mock',
      user: { id: 1, role: 'rider', name: 'Alice', email: 'alice@demo.com' },
    });

    await promise;
    httpMock.verify();
  });
});
