import { useLocation, Link } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '../../data/cards';
import { submitLead } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';
import styles from './Request.module.css';

const AI_CHARACTERISTICS = [
  'generative',
  'a classifier',
  'writes code',
  'trained on public data',
  'prompted by public users',
  'uses RAG',
  'always truthful',
  'transparent',
  'explainable', 
  'unbiased',
  'a commercial model',
  'our own model',
];

const AI_PROVIDERS = [
  'OpenAI',
  'Anthropic',
  'Gemini',
  'Amazon',
  'xAI',
  'open source',
];

const WHO_CONCERNED = [
  'me',
  'coworkers',
  'my boss',
  'our CEO',
  'our board',
  'customers',
  'partners',
  'regulators',
  'general public',
];

export function Request() {
  const location = useLocation();
  const cards = (location.state?.cards || []) as Card[];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    organization: '',
    comments: '',
    aiCharacteristics: [] as string[],
    aiCharacteristicsOther: '',
    aiProviders: [] as string[],
    aiProvidersOther: '',
    concernLevel: null as number | null,
    whoConcerned: [] as string[],
    whoConcernedOther: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isFormValid = formData.name && formData.email && formData.title && formData.organization;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitError(null);

    const result = await submitLead({
      name: formData.name,
      email: formData.email,
      title: formData.title || undefined,
      organization: formData.organization || undefined,
      comments: formData.comments || undefined,
      selected_cards: cards.map(c => ({ id: c.id, name: c.name })),
      ai_characteristics: formData.aiCharacteristics.length > 0 ? formData.aiCharacteristics : undefined,
      ai_characteristics_other: formData.aiCharacteristicsOther || undefined,
      ai_providers: formData.aiProviders.length > 0 ? formData.aiProviders : undefined,
      ai_providers_other: formData.aiProvidersOther || undefined,
      concern_level: formData.concernLevel || undefined,
      who_concerned: formData.whoConcerned.length > 0 ? formData.whoConcerned : undefined,
      who_concerned_other: formData.whoConcernedOther || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitStatus('success');
    } else {
      setSubmitStatus('error');
      setSubmitError(result.error || 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: 'aiCharacteristics' | 'aiProviders' | 'whoConcerned', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>← Back to Cards</Link>
        <div className={styles.branding}>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Longreach logo" className={styles.logo} />
          <h1>Longreach: quick risk analysis</h1>
        </div>
        <p className={styles.intro}>
          Thank you for your interest. We are developing a rich set of tools to diagnose, explain, prevent, and treat many kinds of pathologies that affect AIs. For a free and simple risk analysis, fill out the form below (coming soon).
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          {cards.length > 0 && (
            <p className={styles.cardIntro}>
              I selected {cards.length === 1 ? 'this card' : 'these cards'} because I found {cards.length === 1 ? 'it' : 'them'} interesting. Please send me my free analysis, focusing on {cards.length === 1 ? 'this potential risk' : 'these potential risks'}.
            </p>
          )}
          <div className={styles.cardList}>
            {cards.length > 0 ? (
              cards.map(card => (
                <div key={card.id} className={styles.cardItem}>
                  {card.name}
                </div>
              ))
            ) : (
              <p className={styles.noCards}>No cards selected</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Your Information</h2>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              Title
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              Organization
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              Comments <span className={styles.optional}>(optional)</span>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={4}
              />
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2>My AI is...</h2>
          <div className={styles.checkboxGroup}>
            {AI_CHARACTERISTICS.map(option => (
              <label key={option} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.aiCharacteristics.includes(option)}
                  onChange={() => handleCheckboxChange('aiCharacteristics', option)}
                  className={styles.checkbox}
                />
                {option}
              </label>
            ))}
            <label className={`${styles.checkboxLabel} ${styles.otherRow}`}>
              <input
                type="checkbox"
                checked={formData.aiCharacteristicsOther !== ''}
                onChange={() => {
                  if (formData.aiCharacteristicsOther !== '') {
                    setFormData(prev => ({ ...prev, aiCharacteristicsOther: '' }));
                  }
                }}
                className={styles.checkbox}
              />
              Other:
              <textarea
                value={formData.aiCharacteristicsOther}
                onChange={(e) => setFormData(prev => ({ ...prev, aiCharacteristicsOther: e.target.value }))}
                className={styles.otherInput}
                placeholder="Specify..."
                rows={1}
              />
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2>We're using AI from</h2>
          <div className={styles.checkboxGroup}>
            {AI_PROVIDERS.map(option => (
              <label key={option} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.aiProviders.includes(option)}
                  onChange={() => handleCheckboxChange('aiProviders', option)}
                  className={styles.checkbox}
                />
                {option}
              </label>
            ))}
            <label className={`${styles.checkboxLabel} ${styles.otherRow}`}>
              <input
                type="checkbox"
                checked={formData.aiProvidersOther !== ''}
                onChange={() => {
                  if (formData.aiProvidersOther !== '') {
                    setFormData(prev => ({ ...prev, aiProvidersOther: '' }));
                  }
                }}
                className={styles.checkbox}
              />
              Other:
              <textarea
                value={formData.aiProvidersOther}
                onChange={(e) => setFormData(prev => ({ ...prev, aiProvidersOther: e.target.value }))}
                className={styles.otherInput}
                placeholder="Specify..."
                rows={1}
              />
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2>How concerned are you about risks from your company's AI initiatives?</h2>
          <div className={styles.ratingGroup}>
            <span className={styles.ratingLabel}>1 = not concerned</span>
            <div className={styles.ratingOptions}>
              {[1, 2, 3, 4, 5].map(level => (
                <label key={level} className={styles.ratingOption}>
                  <input
                    type="radio"
                    name="concernLevel"
                    value={level}
                    checked={formData.concernLevel === level}
                    onChange={() => setFormData(prev => ({ ...prev, concernLevel: level }))}
                    className={styles.radio}
                  />
                  {level}
                </label>
              ))}
            </div>
            <span className={styles.ratingLabel}>5 = very concerned</span>
          </div>
        </div>

        <div className={styles.section}>
          <h2>{"If anyone is very concerned, it's"}</h2>
          <div className={styles.checkboxGroup}>
            {WHO_CONCERNED.map(option => (
              <label key={option} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.whoConcerned.includes(option)}
                  onChange={() => handleCheckboxChange('whoConcerned', option)}
                  className={styles.checkbox}
                />
                {option}
              </label>
            ))}
            <label className={`${styles.checkboxLabel} ${styles.otherRow}`}>
              <input
                type="checkbox"
                checked={formData.whoConcernedOther !== ''}
                onChange={() => {
                  if (formData.whoConcernedOther !== '') {
                    setFormData(prev => ({ ...prev, whoConcernedOther: '' }));
                  }
                }}
                className={styles.checkbox}
              />
              Other:
              <textarea
                value={formData.whoConcernedOther}
                onChange={(e) => setFormData(prev => ({ ...prev, whoConcernedOther: e.target.value }))}
                className={styles.otherInput}
                placeholder="Specify..."
                rows={1}
              />
            </label>
          </div>
        </div>

        {submitStatus === 'success' ? (
          <div className={styles.successMessage}>
		Thank you! Your request has been submitted. (Under construction: report is not available yet).
          </div>
        ) : (
          <>
            {submitStatus === 'error' && (
              <div className={styles.errorMessage}>
                {submitError || 'An error occurred. Please try again.'}
              </div>
            )}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!supabase || !isFormValid || isSubmitting}
            >
              {!supabase ? 'Form submission unavailable' :
		  isSubmitting ? 'Submitting...' : 'Request report (Under construction: no report available)'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
