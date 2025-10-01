import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Scissors, CheckCircle } from 'lucide-react';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedServices: [],
    name: '',
    phone: '',
    email: '',
    date: '',
    time: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Servicii exacte din Airtable
  const services = [
    { id: 'haircut', name: 'Tuns Bărbați', price: 50, duration: 30, category: 'Coafură', description: 'Tuns clasic sau modern' },
    { id: 'haircut-women', name: 'Tuns Femei', price: 80, duration: 45, category: 'Coafură', description: 'Tuns scurt, mediu sau lung' },
    { id: 'coloring', name: 'Vopsit Păr', price: 150, duration: 120, category: 'Coafură', description: 'Vopsire completă sau parțială' },
    { id: 'styling', name: 'Coafat', price: 80, duration: 45, category: 'Coafură', description: 'Coafat pentru evenimente' },
    { id: 'beard', name: 'Aranjat Barbă', price: 35, duration: 20, category: 'Barbă', description: 'Contur și aranjare barbă' },
    { id: 'manicure', name: 'Manichiură', price: 70, duration: 60, category: 'Cosmetică', description: 'Clasică sau semipermanentă' },
    { id: 'pedicure', name: 'Pedichiură', price: 80, duration: 60, category: 'Cosmetică', description: 'Clasică sau SPA' },
    { id: 'facial', name: 'Tratament Facial', price: 120, duration: 90, category: 'Cosmetică', description: 'Curățare și hidratare profundă' }
  ];

  const timeSlots = [
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ];

  const handleServiceToggle = (serviceId) => {
    const newServices = formData.selectedServices.includes(serviceId)
      ? formData.selectedServices.filter(id => id !== serviceId)
      : [...formData.selectedServices, serviceId];
    
    setFormData(prev => ({ ...prev, selectedServices: newServices }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTotalPrice = () => {
    return formData.selectedServices.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service ? service.price : 0);
    }, 0);
  };

  const getTotalDuration = () => {
    return formData.selectedServices.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service ? service.duration : 0);
    }, 0);
  };

  const getSelectedServicesNames = () => {
    return formData.selectedServices.map(id => {
      const service = services.find(s => s.id === id);
      return service ? service.name : '';
    }).join(', ');
  };

  const handleSubmit = async () => {
    try {
      const bookingData = {
        date: formData.date,
        time: formData.time,
        services: formData.selectedServices,
        staffId: "anyone",
        clientName: formData.name,
        clientPhone: formData.phone,
        clientEmail: formData.email
      };

      const response = await fetch('https://automations.sferal.ai/allports/webhook/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert(data.error || 'A apărut o eroare la crearea rezervării. Te rugăm să încerci din nou.');
      }
    } catch (error) {
      console.error('Eroare la trimitere:', error);
      alert('A apărut o eroare. Te rugăm să încerci din nou.');
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && formData.selectedServices.length > 0) setCurrentStep(2);
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
            Mulțumim, {formData.name}! Programarea ta pentru {getSelectedServicesNames()}
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
                selectedServices: [],
                name: '',
                phone: '',
                email: '',
                date: '',
                time: ''
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
            <h2 style={styles.stepTitle}>Alege Serviciile</h2>
            <div style={styles.servicesGrid}>
              {services.map(service => (
                <button
                  key={service.id}
                  style={{
                    ...styles.serviceCard,
                    ...(formData.selectedServices.includes(service.id) ? styles.serviceCardActive : {})
                  }}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <Scissors size={24} />
                  <h3 style={styles.serviceName}>{service.name}</h3>
                  <p style={styles.servicePrice}>{service.price} RON</p>
                  <p style={styles.serviceDuration}>{service.duration} min</p>
                  <p style={styles.serviceDescription}>{service.description}</p>
                </button>
              ))}
            </div>
            
            {formData.selectedServices.length > 0 && (
              <div style={styles.selectionSummary}>
                <p><strong>Servicii selectate:</strong> {getSelectedServicesNames()}</p>
                <p><strong>Durată totală:</strong> {getTotalDuration()} minute</p>
                <p><strong>Preț total:</strong> {getTotalPrice()} RON</p>
              </div>
            )}
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
                Ora (Program: 06:00 - 21:00)
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
              <p><strong>Servicii:</strong> {getSelectedServicesNames()}</p>
              <p><strong>Durată totală:</strong> {getTotalDuration()} minute</p>
              <p><strong>Preț total:</strong> {getTotalPrice()} RON</p>
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
                  (currentStep === 1 && formData.selectedServices.length === 0) ||
                  (currentStep === 2 && (!formData.date || !formData.time))
                    ? styles.buttonDisabled 
                    : {}
                )
              }}
              onClick={nextStep}
              disabled={
                (currentStep === 1 && formData.selectedServices.length === 0) ||
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
    maxWidth: '900px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxHeight: '90vh',
    overflowY: 'auto'
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
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
    gap: '8px',
    textAlign: 'center'
  },
  serviceCardActive: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff'
  },
  serviceName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  servicePrice: {
    fontSize: '18px',
    color: '#667eea',
    fontWeight: 'bold',
    margin: 0
  },
  serviceDuration: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  serviceDescription: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0
  },
  selectionSummary: {
    backgroundColor: '#f0f4ff',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #667eea'
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
