import React, { useState, useEffect } from 'react';

const ChatInterface = () => {
  const [enteredCode, setEnteredCode] = useState('');
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('');
  const [fetchedData, setFetchedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [domains, setDomains] = useState([]); 

 
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/domains');
        if (!response.ok) throw new Error('Failed to fetch domains');
        const data = await response.json();
        setDomains(data);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };
    
    fetchDomains();
  }, []);

  const handleLookup = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'Lookup Milestone', code: enteredCode }) // Ensure action is used
      });
      if (!response.ok) throw new Error('Milestone not found');
      const data = await response.json();
      setFetchedData(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      setFetchedData(null);
    }
  };


  const handleListDomain = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'List Domain', domain, level }) // Changed type to action
      });
      if (!response.ok) throw new Error('No data found for this domain and level');
      const data = await response.json();
      setFetchedData(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
      setFetchedData(null);
    }
  };

  return (
    <div>
      <h1>Chat Interface</h1>

      <div>
        <h2>Lookup Milestone</h2>
        <input
          type="text"
          placeholder="Enter Milestone Code"
          value={enteredCode}
          onChange={(e) => setEnteredCode(e.target.value)}
        />
        <button onClick={handleLookup}>Lookup</button>
      </div>


      <div>
        <h2>List Domain</h2>
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="">Select Domain</option>
          {domains.length > 0 ? (
            domains.map((domainName) => (
              <option key={domainName} value={domainName}>
                {domainName}
              </option>
            ))
          ) : (
            <option disabled>Loading domains...</option>
          )}
        </select>

        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Select Level</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
        </select>

        <button onClick={handleListDomain}>List Domain</button>
      </div>

      <div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {fetchedData && (
          <div>
            <h3>Fetched Data</h3>
            <pre>{JSON.stringify(fetchedData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
