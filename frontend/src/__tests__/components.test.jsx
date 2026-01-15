import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from '../components/Login';
import Signup from '../components/Signup';
import Home from '../components/Home';
import { AuthProvider } from '../context/AuthContext';

// Mock router
const MockRouter = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Frontend Component Tests', () => {
  // ========== TESTS COMPOSANTS (10 tests) ==========

  describe('Login Component', () => {
    it('FT-01: Should render login form', () => {
      render(
        <MockRouter>
          <Login />
        </MockRouter>
      );

      expect(screen.getByText(/connexion/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it('FT-02: Should have submit button', () => {
      render(
        <MockRouter>
          <Login />
        </MockRouter>
      );

      const submitButton = screen.getByRole('button', { name: /se connecter/i });
      expect(submitButton).toBeInTheDocument();
    });

    it('FT-03: Should have link to signup', () => {
      render(
        <MockRouter>
          <Login />
        </MockRouter>
      );

      expect(screen.getByText(/pas encore de compte/i)).toBeInTheDocument();
      expect(screen.getByText(/s'inscrire/i)).toBeInTheDocument();
    });
  });

  describe('Signup Component', () => {
    it('FT-04: Should render signup form', () => {
      render(
        <MockRouter>
          <Signup />
        </MockRouter>
      );

      expect(screen.getAllByText(/créer un compte/i).length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/email/i).length).toBeGreaterThan(0);
    });

    it('FT-05: Should have password fields', () => {
      render(
        <MockRouter>
          <Signup />
        </MockRouter>
      );

      const passwordInputs = screen.getAllByLabelText(/mot de passe/i);
      expect(passwordInputs).toHaveLength(2);
    });

    it('FT-06: Should have submit button', () => {
      render(
        <MockRouter>
          <Signup />
        </MockRouter>
      );

      const submitButton = screen.getByRole('button', { name: /créer un compte/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Home Component', () => {
    it('FT-07: Should render welcome message', () => {
      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      expect(screen.getByText(/bienvenue sur easybooking/i)).toBeInTheDocument();
    });

    it('FT-08: Should show features', () => {
      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      expect(screen.getByText(/réservation simple/i)).toBeInTheDocument();
      expect(screen.getByText(/disponibilité en temps réel/i)).toBeInTheDocument();
    });

    it('FT-09: Should have signup button', () => {
      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      const signupLink = screen.getByText(/créer un compte/i);
      expect(signupLink).toBeInTheDocument();
    });

    it('FT-10: Should have login button', () => {
      render(
        <MockRouter>
          <Home />
        </MockRouter>
      );

      const loginLink = screen.getByText(/se connecter/i);
      expect(loginLink).toBeInTheDocument();
    });
  });
});