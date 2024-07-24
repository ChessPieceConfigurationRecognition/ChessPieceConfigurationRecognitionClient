import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrainingPanel from './components/TrainingPanel';
import Model from './components/Model';

const App: React.FC = () => {
    const [modelList, setModelList] = useState<{ name: string, type: string }[]>([]);

    const fetchModelList = async () => {
        try {
            const serverUrl = import.meta.env.VITE_SERVER_URL;
            const response = await fetch(`${serverUrl}/models`);
            const data = await response.json();
            setModelList(data.model_list);
        } catch (error) {
            console.error('Error fetching model list:', error);
        }
    };

    useEffect(() => {
        fetchModelList();
    }, []);

    return (
      <Router>
          <div>
              <Routes>
                  <Route path='/' element={<TrainingPanel onTrainingComplete={fetchModelList} modelList={modelList} />} />
                  <Route path='/:type/:name' element={<Model name='' type='' />} />
              </Routes>
          </div>
      </Router>
  );
};

export default App;
