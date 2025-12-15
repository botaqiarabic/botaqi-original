import React from 'react';

const TestDashboard: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-red-600">TEST DASHBOARD</h1>
      <p className="text-lg text-gray-600">If you can see this, the Layout is working!</p>
      <div className="bg-blue-100 p-4 rounded-lg mt-4">
        <p>This is a test component to verify the Layout is rendering children properly.</p>
      </div>
    </div>
  );
};

export default TestDashboard;
