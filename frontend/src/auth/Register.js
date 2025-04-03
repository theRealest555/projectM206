import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import validator from 'validator';

const Register = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    username: '', 
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validator.isEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers and underscores';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await axios.post('http://localhost:3003/api/auth/register', {
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });

      if (response.status === 201) {
        navigate('/login', { 
          state: { 
            registrationSuccess: true,
            email: formData.email 
          } 
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 409) {
          setApiError(err.response.data.message || 'User already exists');
        } else {
          setApiError(err.response.data.message || 'Registration failed');
        }
      } else if (err.request) {
        // Request was made but no response
        setApiError('Network error - please check your connection');
      } else {
        // Other errors
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

    // Clear error when user types
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
            <h2 className="fw-bold">Create Account</h2>
            <p className="text-muted">Join our community today</p>
          </div>

          {apiError && (
            <Alert variant="danger" className="text-center">
              {apiError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="Enter your email"
                autoComplete="email"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                isInvalid={!!errors.username}
                placeholder="Choose a username"
                autoComplete="username"
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                At least 8 characters with 1 uppercase and 1 number
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 fw-bold"
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
                  Registering...
                </>
              ) : 'Create Account'}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <p className="text-muted mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;