const Landing = () => {
  console.log('🎯 Landing component is rendering!');

  return (
    <div style={{
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀 Gulfara Landing Page</h1>
      <p style={{ fontSize: '1.5rem' }}>If you can see this, the component is working!</p>
      <button
        style={{
          padding: '15px 30px',
          fontSize: '1.2rem',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '10px',
          marginTop: '20px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
};

export default Landing;