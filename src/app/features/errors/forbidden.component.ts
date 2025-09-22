// src/app/features/errors/forbidden.component.ts
import { Component } from '@angular/core';
@Component({
  standalone: true,
  template: `<div style="padding:24px">
    <h2>403 — Accès refusé</h2>
    <p>Vous n'avez pas les droits pour cette page.</p>
  </div>`,
})
export class ForbiddenComponent {}
