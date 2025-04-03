import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import validator from 'validator';
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if coming from registration
  React.useEffect(() => {
    if (location.state?.registrationSuccess) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email || ''
      }));
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validator.isEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { data } = await axios.post(
        'http://localhost:3003/api/auth/login',
        {
          email: formData.email.trim(),
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      localStorage.setItem('token', data.token);
      
      // Store user data without sensitive information
      localStorage.setItem('user', JSON.stringify({
        email: data.user.email,
        username: data.user.username,
        role: data.user.role
      }));

      // Redirect to intended path or home
      navigate(location.state?.from?.pathname || '/', { 
        replace: true 
      });

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setApiError('Invalid email or password');
            break;
          case 403:
            setApiError('Account is blocked. Please contact support.');
            break;
          case 429:
            setApiError('Too many attempts. Try again later.');
            break;
          default:
            setApiError(err.response.data?.message || 'Login failed');
        }
      } else if (err.request) {
        setApiError('Network error. Please check your connection.');
      } else {
        setApiError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold">Welcome Back</h2>
            <p className="text-muted">Sign in to continue</p>
          </div>

          {location.state?.registrationSuccess && (
            <Alert variant="success" className="text-center">
              Registration successful! Please log in.
            </Alert>
          )}

          {apiError && (
            <Alert variant="danger" className="text-center">
              {apiError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <FiMail />
                </span>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="Enter your email"
                  autoComplete="email"
                  autoFocus={!location.state?.registrationSuccess}
                />
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text">
                  <FiLock />
                </span>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  autoFocus={location.state?.registrationSuccess}
                />
              </div>
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
              <div className="text-end mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-decoration-none small"
                >
                  Forgot password?
                </Link>
              </div>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 fw-bold mt-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <FiLogIn className="me-2" />
                  Sign In
                </>
              )}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <p className="text-muted mb-0">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary fw-semibold"
                state={{ from: location.state?.from }}
              >
                Create one
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;