import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Scissors, CheckCircle } from 'lucide-react';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const services = [
    { id: 1, name: 'Tuns Damă', price: '80 RON', duration: '45 min' },
    { id: 2, name: 'Tuns Bărbat', price: '50 RON', duration: '30 min' },
    { id: 3, name: 'Vopsit', price: '150 RON', duration: '90 min' },
    { id: 4, name: 'Coafat', price: '100 RON', duration: '60 min' },
    { id: 5, name: 'Manichiură', price: '70 RON', duration: '45 min' },
    { id: 6, name: 'Pedichiură', price: '80 RON', duration: '60 min' }
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const responses = await Promise.all([
        fetch('https://eugen.app.n8n.cloud/webhook/salon-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }),
        
        fetch('YOUR_MAKE_WEBHOOK_URL', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }),
        
        fetch('YOUR_ZAPIER_WEBHOOK_URL', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      ]);

      console.log('Răspunsuri API:', responses);
      setSubmitted(true);
    } catch (error) {
      console.error('Eroare la trimitere:', error);
      alert('A apărut o eroare. Te rugăm să încerci din nou.');
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && formData.service) setCurrentStep(2);
    else if (currentStep === 2 && formData.date && formData.time) setCurrentStep(3);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <CheckCircle size={64} color="#10b981" />
          <h1 style={styles.successTitle}>Programare Confirmată!</h1>
          <p style={styles.successText}>
            Mulțumim, {formData.name}! Programarea ta pentru {formData.service} 
            pe data de {formData.date} la ora {formData.time} a fost confirmată.
          </p>
          <p style={styles.successSubtext}>
            Vei primi un email de confirmare la {formData.email}
          </p>
          <button 
            style={styles.successButton}
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData({
                name: '', phone: '', email: '', service: '', date: '', time: ''
              });
            }}
          >
            Programare Nouă
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          <Scissors size={32} />
          Programare Salon
        </h1>

        <div style={styles.stepsContainer}>
          {[1, 2, 3].map(step => (
            <div key={step} style={styles.stepWrapper}>
              <div style={{
                ...styles.stepCircle,
                ...(currentStep >= step ? styles.stepActive : {})
              }}>
                {step}
              </div>
              {step < 3 && <div style={styles.stepLine} />}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Alege Serviciul</h2>
            <div style={styles.servicesGrid}>
              {services.map(service => (
                <button
                  key={service.id}
                  style={{
                    ...styles.serviceCard,
                    ...(formData.service === service.name ? styles.serviceCardActive : {})
                  }}
                  onClick={() => handleInputChange('service', service.name)}
                >
                  <Scissors size={24} />
                  <h3 style={styles.serviceName}>{service.name}</h3>
                  <p style={styles.servicePrice}>{service.price}</p>
                  <p style={styles.serviceDuration}>{service.duration}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Alege Data și Ora</h2>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Calendar size={20} />
                Data
              </label>
              <input
                type="date"
                style={styles.input}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Clock size={20} />
                Ora
              </label>
              <div style={styles.timeSlotsGrid}>
                {timeSlots.map(time => (
                  <button
                    key={time}
                    style={{
                      ...styles.timeSlot,
                      ...(formData.time === time ? styles.timeSlotActive : {})
                    }}
                    onClick={() => handleInputChange('time', time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={styles.stepContent}>
            <h2 style={styles.stepTitle}>Date de Contact</h2>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <User size={20} />
                Nume Complet
              </label>
              <input
                type="text"
                style={styles.input}
                placeholder="Ionescu Maria"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Phone size={20} />
                Telefon
              </label>
              <input
                type="tel"
                style={styles.input}
                placeholder="0712345678"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Mail size={20} />
                Email
              </label>
              <input
                type="email"
                style={styles.input}
                placeholder="exemplu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>Rezumat Programare</h3>
              <p><strong>Serviciu:</strong> {formData.service}</p>
              <p><strong>Data:</strong> {formData.date}</p>
              <p><strong>Ora:</strong> {formData.time}</p>
            </div>
          </div>
        )}

        <div style={styles.buttonGroup}>
          {currentStep > 1 && (
            <button style={styles.buttonSecondary} onClick={prevStep}>
              Înapoi
            </button>
          )}
          
          {currentStep < 3 ? (
            <button 
              style={{
                ...styles.buttonPrimary,
                ...(
                  (currentStep === 1 && !formData.service) ||
                  (currentStep === 2 && (!formData.date || !formData.time))
                    ? styles.buttonDisabled 
                    : {}
                )
              }}
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !formData.service) ||
                (currentStep === 2 && (!formData.date || !formData.time))
              }
            >
              Continuă
            </button>
          ) : (
            <button 
              style={{
                ...styles.buttonPrimary,
                ...(!formData.name || !formData.phone || !formData.email 
                  ? styles.buttonDisabled 
                  : {})
              }}
              onClick={handleSubmit}
              disabled={!formData.name || !formData.phone || !formData.email}
            >
              Confirmă Programarea
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '40px',
    gap: '10px'
  },
  stepWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  stepCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#9ca3af',
    backgroundColor: 'white'
  },
  stepActive: {
    backgroundColor: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },
  stepLine: {
    width: '60px',
    height: '2px',
    backgroundColor: '#e5e7eb'
  },
  stepContent: {
    marginBottom: '30px'
  },
  stepTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px'
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  serviceCard: {
    padding: '20px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  serviceCardActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff'
  },
  serviceName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  servicePrice: {
    fontSize: '18px',
    color: '#667eea',
    fontWeight: 'bold'
  },
  serviceDuration: {
    fontSize: '14px',
    color: '#6b7280'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s'
  },
  timeSlotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px'
  },
  timeSlot: {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'white',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s'
  },
  timeSlotActive: {
    backgroundColor: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },
  summary: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
    marginTop: '20px'
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#1f2937'
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end'
  },
  buttonPrimary: {
    padding: '12px 30px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonSecondary: {
    padding: '12px 30px',
    backgroundColor: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '60px 40px',
    maxWidth: '600px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
  },
  successTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  successText: {
    fontSize: '18px',
    color: '#4b5563',
    lineHeight: '1.6'
  },
  successSubtext: {
    fontSize: '14px',
    color: '#6b7280'
  },
  successButton: {
    padding: '12px 30px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export default App;
