import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginPageComponent } from './app/features/auth/login-page/login-page.component';
import { AuthService } from './app/core/services/auth.service';

class MockAuthService {
  user = () => null;
  isLoggedIn = () => false;
  login = jasmine.createSpy('login').and.resolveTo({
    id: 1,
    role: 'rider',
    name: 'Alice',
    email: 'alice@demo.com',
  });
  logout = jasmine.createSpy('logout');
}

describe('LoginPageComponent (integration)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService }, // ⬅️ ATTENTION: token = classe, pas une string
      ],
    }).compileComponents();
  });

  it('should render the login form', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toContain('Connexion');
    expect(el.querySelector('form')).toBeTruthy();
  });

  it('should call login when submitting form', async () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const comp = fixture.componentInstance;
    const auth = TestBed.inject(AuthService) as unknown as MockAuthService;

    comp.form.setValue({ email: 'alice@demo.com', password: 'demo123' });
    await comp.onSubmit();

    expect(auth.login).toHaveBeenCalledWith('alice@demo.com', 'demo123');
  });
});
