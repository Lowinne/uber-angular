import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighlightDirective } from './highlight.directive';

@Component({
  template: '<p appHighlight="pink">Hello</p>',
  standalone: true,
  imports: [HighlightDirective],
})
class TestComponent {}

describe('HighlightDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let p: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    p = fixture.nativeElement.querySelector('p')!;
  });

  it('should apply highlight color on hover', () => {
    p.dispatchEvent(new Event('mouseenter'));
    expect(p.style.backgroundColor).toBe('pink');

    p.dispatchEvent(new Event('mouseleave'));
    expect(p.style.backgroundColor).toBe('');
  });
});
