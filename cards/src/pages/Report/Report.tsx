import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Report.css';

const MODAL_API_URL = 'https://longreach--report-output-fastapi-app.modal.run';

export function Report() {
  const { lid } = useParams<{ lid: string }>();
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lid) {
      setError('No report ID provided');
      setLoading(false);
      return;
    }

    fetch(`${MODAL_API_URL}/report/${lid}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReport(data.report);
        } else {
          setError(data.error || 'Report not found');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch report:', err);
        setError('Failed to load report');
      })
      .finally(() => setLoading(false));
  }, [lid]);

  if (loading) {
    return (
      <div className="report-container">
        <div className="report-loading">Loading your report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-container">
        <div className="report-error">
          <h1>Report Not Found</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-content" dangerouslySetInnerHTML={{ __html: report || '' }} />
    </div>
  );
}
