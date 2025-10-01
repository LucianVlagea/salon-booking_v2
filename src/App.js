import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, Scissors, CheckCircle, Loader } from 'lucide-react';

const API_BASE = 'https://automations.sferal.ai/allports/webhook';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    selectedServices: [],
    staffId: 'anyone',
    date: '',
    time: '',
    clientName: '',
    clientPhone: '',
    clientEmail: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/config`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services || []);
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error('Eroare la încărcarea configurației:', error);
      alert('Nu s-au putut încărca serviciile. Reîncarcă pagina.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (date, serviceIds) => {
    if (!date || serviceIds.length === 0) return;
    
    setLoadingSlots(true);
    try {
      const servicesParam = serviceIds.join(',');
      const url = `${API_BASE}/available-slots?date=${date}&services=${servicesParam}&staffId=${formData.staffId}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.availableSlots || {});
      } else {
        alert('Nu s-au putut încărca sloturile disponibile.');
      }
    } catch (error) {
      console.error('Eroare la încărcarea sloturilor:', error);
      alert('Eroare la verificarea disponibilității.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    const newServices = formData.selectedServices.includes(serviceId)
      ? formData.selectedServices.filter(id => id !== serviceId)
      : [...formData.selectedServices, serviceId];
    
    setFormData(prev => ({ ...prev, selectedServices: newServices }));
    
    if (formData.date && newServices.length > 0) {
      loadAvailableSlots(formData.date, newServices);
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date, time: '' }));
    if (formData.selectedServices.length > 0) {
      loadAvailableSlots(date, formData.selectedServices);
    }
  };

  const handleSubmit = async () => {
    try {
      const bookingData = {
        date: formData.date,
        time: formData.time,
        services: formData.selectedServices,
        staffId: formData.staffId,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail
      };

      const response = await fetch(`${API_BASE}/create-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        alert(data.error || 'A apărut o eroare la crearea rezervării.');
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

  const getSelectedServicesDetails = () => {
    return services.filter(s => formData.selectedServices.includes(s.id));
  };

  const getTotalPrice = () => {
    return getSelectedServicesDetails().reduce((sum, s) => sum + s.price, 0);
  };

  const getTotalDuration = () => {
    return getSelectedServicesDetails().reduce((sum, s) => sum + s.duration, 0);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '20px', fontSize: '18px' }}>Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const selectedServices = getSelectedServicesDetails();
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <CheckCircle size={64} color="#10b981" />
          <h1 style={styles.successTitle}>Programare Confirmată!</h1>
          <p style={styles.successText}>
            Mulțumim, {formData.clientName}! Programarea ta pentru{' '}
            {selectedServices.map(s => s.name).join(', ')} pe data de{' '}
            {formData.date} la ora {formData.time} a fost confirmată.
          </p>
          <p style={styles.successSubtext}>
            Vei primi un email de confirmare la {formData.clientEmail}
          </p>
          <button 
            style={styles.successButton}
            onClick={() => {
              setSubmitted(false);
              setCurrentStep(1);
              setFormData({
                selectedServices: [],
                staffId: 'anyone',
                date: '',
                time: '',
                clientName: '',
                clientPhone: '',
                clientEmail: ''
              });
              setAvailableSlots({});
            }}
          >
            Programare Nouă
          </button>
        </div>
      </div>
    );
  }

  const allTimeSlots = [
    ...(availableSlots.morning || []),
    ...(availableSlots.afternoon || []),
    ...(availableSlots.evening || [])
  ];

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
                  {service.description && (
                    <p style={styles.serviceDescription}>{service.description}</p>
                  )}
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
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {formData.date && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Clock size={20} />
                  Ora {loadingSlots && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                </label>
                
                {loadingSlots ? (
                  <p style={{ textAlign: 'center', padding: '20px' }}>Se verifică disponibilitatea...</p>
                ) : allTimeSlots.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                    Nu există sloturi disponibile pentru această dată. Selectează altă dată.
                  </p>
                ) : (
                  <>
                    {availableSlots.morning && availableSlots.morning.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={styles.timeGroupTitle}>Dimineața (6:00 - 12:00)</h4>
                        <div style={styles.timeSlotsGrid}>
                          {availableSlots.morning.map(time => (
                            <button
                              key={time}
                              style={{
                                ...styles.timeSlot,
                                ...(formData.time === time ? styles.timeSlotActive : {})
                              }}
                              onClick={() => setFormData(prev => ({ ...prev, time }))}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {availableSlots.afternoon && availableSlots.afternoon.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={styles.timeGroupTitle}>După-amiaza (12:00 - 18:00)</h4>
                        <div style={styles.timeSlotsGrid}>
                          {availableSlots.afternoon.map(time => (
                            <button
                              key={time}
                              style={{
                                ...styles.timeSlot,
                                ...(formData.time === time ? styles.timeSlotActive : {})
                              }}
                              onClick={() => setFormData(prev => ({ ...prev, time }))}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {availableSlots.evening && availableSlots.evening.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={styles.timeGroupTitle}>Seara (18:00 - 21:00)</h4>
                        <div style={styles.timeSlotsGrid}>
                          {availableSlots.evening.map(time => (
                            <button
                              key={time}
                              style={{
                                ...styles.timeSlot,
                                ...(formData.time === time ? styles.timeSlotActive : {})
                              }}
                              onClick={() => setFormData(prev => ({ ...prev, time }))}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
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
                value={formData.clientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
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
                value={formData.clientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
              />
            </div>

            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>Rezumat Programare</h3>
              <p><strong>Servicii:</strong> {getSelectedServicesDetails().map(s => s.name).join(', ')}</p>
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
                ...(!formData.clientName || !formData.clientPhone || !formData.clientEmail 
                  ? styles.buttonDisabled 
                  : {})
              }}
              onClick={handleSubmit}
              disabled={!formData.clientName || !formData.clientPhone || !formData.clientEmail}
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
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '60px',
    textAlign: 'center'
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
    margin: '4px 0 0 0'
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
  timeGroupTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: '10px'
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
